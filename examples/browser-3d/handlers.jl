using HttpServer
using WebSockets
import JSON


"""
Serve page(s) and supporting files over HTTP. Assumes the server is started
from the location of this script. Searches through server root directory and
subdirectories recursively for the requested resource.
"""
function http_handler()
    httph = HttpHandler() do req::Request, res::Response
        # Handle case where / means index.html
        if req.resource == "/"
            println("serving ", req.resource)
            return Response(readstring("index.html"))
        end
        # Serve requested file if found, else return a 404.
        for (root, dirs, files) in walkdir(".")
            for file in files
                file = replace(joinpath(root, file), "./", "")
                if startswith("/$file", req.resource)
                    println("serving ", file)
                    return Response(open(readstring, file))
                end
            end
        end
        return Response(404)
    end
    httph.events["error"] = (client, err) -> println(err)
    httph.events["listen"] = (port) -> println("Listening on $port...")
    return httph
end


function websocket_handler(callback::Function, callback_args::AbstractVector=[])
    wsh = WebSocketHandler() do req, client
        println("Handling WebSocket client")
        println("    client.id: ",         client.id)
        println("    client.socket: ",     client.socket)
        println("    client.is_closed: ",  client.is_closed)
        println("    client.sent_close: ", client.sent_close)

        while true
            # Read string from client, decode, and parse to Dict
            msg = JSON.parse(String(copy(read(client))))
            if haskey(msg, "text") && msg["text"] == "ready"
                println("Received update from client: ready")
                callback(client, callback_args...)
            end
        end
    end
    return wsh
end
