import argparse
import socket
import sys

BUFFER_SIZE = 65535


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Python UDP Server")
    parser.add_argument(
        "--host",
        type=str,
        default="0.0.0.0",
        help="Host address",
    )
    parser.add_argument("--port", type=int, default=8000, help="Port number")
    return parser.parse_args()


def validate(data: bytes) -> bool:
    size = len(data)
    if size < 2:
        print("Data too short to be valid.")
        return False
    if (size - 2) % 3 != 0:
        print(f"Data size of {size} is not of the form 2 + 3n.")
        return False
    num_pairs = int.from_bytes(data[0:2], byteorder="big")
    expected_size = 2 + num_pairs * 3
    if size != expected_size:
        print(
            f"Data size {size} does not match expected size {expected_size}."
        )
        return False
    print(f"Received datagram of size {size} is valid.")

    pairs_to_print = min(5, num_pairs)
    for i in range(pairs_to_print):
        offset = 2 + i * 3
        letter = chr(data[offset])
        number = int.from_bytes(data[offset + 1 : offset + 3], byteorder="big")
        print(f"  Pair {i+1}: '{letter}' -> {number}")
    if num_pairs > pairs_to_print:
        print(f"  ... and {num_pairs - pairs_to_print} more pairs")
    return True


def main() -> None:
    args = parse_arguments()
    host = args.host
    port = args.port

    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    except OSError as e:
        print(f"Failed to create socket: {e}")
        sys.exit(1)

    try:
        sock.bind((host, port))
        print(f"UDP server listening on {host}:{port}")
    except OSError as e:
        print(f"Failed to bind socket to {host}:{port}: {e}")
        sock.close()
        sys.exit(1)

    try:
        while True:
            try:
                data, addr = sock.recvfrom(BUFFER_SIZE)
                print(f"Received datagram from {addr}")
                if validate(data):
                    response = "VALID"
                else:
                    response = "INVALID"
                sock.sendto(response.encode("utf-8"), addr)
                print(f"Sent response to {addr}")
            except OSError as e:
                print(f"Error while receiving datagram: {e}")
                continue
            except UnicodeDecodeError as e:
                print(f"Error encoding response: {e}")
                continue
    except KeyboardInterrupt:
        print("Server is shutting down")
    except Exception as e:
        print(f"Unexpected error: {e}")
    finally:
        sock.close()
        print("Socket closed")


if __name__ == "__main__":
    main()
