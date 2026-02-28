import argparse
import io
import socket

BUFFER_SIZE = 1024


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Python UDP Client")
    parser.add_argument(
        "--host",
        type=str,
        default="0.0.0.0",
        help="Host address",
    )
    parser.add_argument("--port", type=int, default=8000, help="Port number")
    parser.add_argument(
        "--sizes",
        type=int,
        nargs="*",
        default=[1, 11, 200, 1000, 2000],
        help="List of datagram sizes to send",
    )
    return parser.parse_args()


def create_datagram(size: int) -> bytes:
    if size < 2:
        raise ValueError(
            "Size must be at least 2 bytes to include size header."
        )
    if size > 65535:
        raise OverflowError("Size must not exceed 65535 bytes.")
    if (size - 2) % 3 != 0:
        raise ValueError("Size must be 2 + 3n.")
    num_pairs = (size - 2) // 3
    binary_stream = io.BytesIO()
    binary_stream.write(num_pairs.to_bytes(2, byteorder="big"))

    cur_letter = ord("A")
    cur_number = 0

    for _ in range(num_pairs):
        binary_stream.write(bytes([cur_letter]))
        binary_stream.write(cur_number.to_bytes(2, byteorder="big"))
        cur_letter += 1
        if cur_letter > ord("Z"):
            cur_letter = ord("A")
        cur_number += 1
        if cur_number > 0xFFFF:
            cur_number = 0

    return binary_stream.getvalue()


def main() -> None:
    args = parse_arguments()
    port = args.port
    host = args.host
    sizes = args.sizes

    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(1.0)
        for size in sizes:
            try:
                datagram = create_datagram(size)
            except ValueError as e:
                print(f"Skipping size {size}: {e}")
                continue
            except OverflowError as e:
                print(f"Overflow error for size {size}: {e}")
                continue
            try:
                sock.sendto(datagram, (host, port))
                print(f"Sent datagram of size {size} bytes to {host}:{port}")
            except OSError as e:
                print(f"Sending failed for size {size}: {e}")
                continue
            try:
                response = sock.recv(BUFFER_SIZE)
                try:
                    text_response = response.decode("utf-8")
                    if text_response == "VALID":
                        print(f"Received VALID response for size {size}.")
                    elif text_response == "INVALID":
                        print(f"Received INVALID response for size {size}")
                    else:
                        print(
                            f"Received unexpected response for size {size}: {text_response}"
                        )
                except UnicodeDecodeError:
                    print(f"Decoded response is not valid UTF-8: {response}")
            except TimeoutError:
                print(f"Timeout waiting for response for size {size}.")
            except OSError as e:
                print(f"Receiving response failed: {e}")


if __name__ == "__main__":
    main()
