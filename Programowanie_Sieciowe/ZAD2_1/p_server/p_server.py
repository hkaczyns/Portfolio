import argparse
import socket
import struct
import sys

BUFFER_SIZE = 1024
TEXT_SIZE = 64

# int16 (2B) + int32 (4B) + char[64] (64B) = 70 bytes
NODE_STRUCT = struct.Struct(">hi64s")


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Python TCP Server - Task 2.1"
    )
    parser.add_argument(
        "--host",
        type=str,
        default="0.0.0.0",
        help="Host address",
    )
    parser.add_argument("--port", type=int, default=8000, help="Port number")

    return parser.parse_args()


def unpack_nodes(conn: socket.socket, addr: tuple) -> None:
    print(f"Connect from {addr}")
    print(f"Expected node size: {NODE_STRUCT.size} bytes\n")

    received_data = bytearray()
    node_count = 0

    try:
        while True:
            try:
                data = conn.recv(BUFFER_SIZE)
            except OSError as e:
                print(f"Error while receiving data: {e}")
                break

            if not data:
                print("\nNo more data, closing connection.")
                break
            received_data.extend(data)
            print(
                f"Received {len(data)} bytes, total in buffer: {len(received_data)} bytes"
            )

            # Structures are unpacked from the buffer
            while len(received_data) >= NODE_STRUCT.size:
                node_data = received_data[: NODE_STRUCT.size]
                del received_data[: NODE_STRUCT.size]

                try:
                    val16, val32, text_bytes = NODE_STRUCT.unpack(node_data)
                except struct.error as e:
                    print(f"Error unpacking node: {e}")
                    continue

                # Remove null terminator and decode text
                try:
                    text = text_bytes.split(b"\x00", 1)[0].decode("utf-8")
                except UnicodeDecodeError as e:
                    print(f"Error decoding text: {e}")
                    continue
                node_count += 1
                print(
                    f"Node {node_count} - int16: {val16}, int32: {val32}, "
                    f"text: '{text}'"
                )

        print(f"\nTotal nodes unpacked: {node_count}")
        print(f"Remaining bytes in buffer: {len(received_data)}")
    except Exception as e:
        print(f"Unexpected error: {e}")


def main() -> None:
    args = parse_arguments()
    host = args.host
    port = args.port

    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    except OSError as e:
        print(f"Failed to create socket: {e}")
        sys.exit(1)

    try:
        try:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        except OSError as e:
            print(f"Failed to set socket options: {e}")
            sys.exit(1)

        try:
            sock.bind((host, port))
        except OSError as e:
            print(f"Failed to bind socket: {e}")
            sys.exit(1)

        print(f"TCP server listening on {host}:{port}")
        print(f"Node size: {NODE_STRUCT.size} bytes\n")

        try:
            sock.listen()
        except OSError as e:
            print(f"Failed to listen on socket: {e}")
            sys.exit(1)

        while True:
            try:
                conn, addr = sock.accept()
            except KeyboardInterrupt:
                print("\nServer shutting down...")
                break
            except OSError as e:
                print(f"Error accepting connection: {e}")
                continue

            with conn:
                unpack_nodes(conn, addr)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)
    finally:
        sock.close()


if __name__ == "__main__":
    main()
