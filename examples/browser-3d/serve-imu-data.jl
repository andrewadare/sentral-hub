using LibSerialPort
import JSON

include("handlers.jl")


function send_imu_data(client::WebSockets.WebSocket)
    sp = open(ARGS[1], parse(Int, ARGS[2]))
    input_line = ""
    mcu_message = ""

    println("Starting I/O loop. Press ENTER to stop server.")

    while true
        # Poll for new data without blocking
        @async input_line = readline(STDIN, chomp=false)
        @async mcu_message *= readstring(sp)

        endswith(input_line, "\n") && quit()

        if contains(mcu_message, "\r\n")
            lines = split(mcu_message, "\r\n")
            while length(lines) > 1
                line = shift!(lines)
                println(line)  # debug
                try
                    data_dict = JSON.parse(line)
                    msg = Dict{AbstractString, Any}()
                    msg["type"] = "imu"
                    msg["data"] = data_dict
                    msg["timestamp"] = time()
                    write(client, JSON.json(msg))
                end
            end
            mcu_message = lines[1]
        end

        # Give the queued tasks a chance to run
        sleep(0.0001)
    end
    return nothing
end


function main()
    if length(ARGS) != 2
        println("Usage: $(basename(@__FILE__)) port baudrate.")
        println("Available ports:")
        list_ports()
        return
    end

    httph = http_handler()
    wsh = websocket_handler(send_imu_data)
    server = Server(httph, wsh)

    println("Starting WebSocket server.")
    run(server, 8000)
end


main()
