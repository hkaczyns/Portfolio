import argparse
import io
import socket


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Python UDP Client")
    parser.add_argument(
        "--host",
        type=str,
        default="::1",
        help="Server address",
    )
    parser.add_argument("--port", type=int, default=8000, help="Port number")
    parser.add_argument("--size", type=int, default=1026, help="Datagram size")
    parser.add_argument(
        "--timeout",
        type=float,
        default=2.0,
        help="Socket timeout in seconds",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=10,
        help="Number of datagrams to send",
    )
    parser.add_argument(
        "--max-retries",
        type=int,
        default=5,
        help="Maximum number of retries",
    )
    return parser.parse_args()


def create_datagram(size: int, sequence_number: int) -> bytes:
    if size < 3:
        raise ValueError(
            "Size must be at least 3 bytes to include size header (seq + num_pairs)."
        )
    if (size - 3) % 3 != 0:
        raise ValueError("Size must be 3 + 3n.")
    num_pairs = (size - 3) // 3

    binary_stream = io.BytesIO()

    binary_stream.write(sequence_number.to_bytes(1, byteorder="big"))
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


def create_socket(timeout: float) -> socket.socket:
    sock = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)
    sock.settimeout(timeout)
    return sock


def send_datagram(
    sock: socket.socket,
    datagram: bytes,
    host: str,
    port: int,
    packet_number: int,
    sequence_number: int,
    size: int,
    retries: int,
) -> bool:
    try:
        sock.sendto(datagram, (host, port))
        print(
            f"Sent packet {packet_number} (seq {sequence_number}) "
            f"of size {size} to {host}:{port} "
            f"(attempt {retries + 1})"
        )
        return True
    except OSError as e:
        print(f"Sending failed for packet {packet_number}: {e}")
        return False


def receive_response(
    sock: socket.socket, size: int
) -> tuple[str | None, bool]:
    try:
        response = sock.recv(size)
    except TimeoutError:
        return None, True
    except OSError as e:
        print(f"Receiving response failed: {e}")
        return None, False

    try:
        text_response = response.decode("utf-8")
        return text_response, True
    except UnicodeDecodeError:
        print(f"Decoded response is not valid UTF-8: {response}")
        return None, True


def validate_response(
    text_response: str, sequence_number: int, packet_number: int
) -> tuple[bool, bool]:
    if text_response == f"ACK{sequence_number}":
        print(f"Received VALID response for packet {packet_number}.")
        return True, True
    elif text_response == f"ACK{1-sequence_number}":
        print(
            f"Received incorrect ACK number for packet {packet_number} "
            f"(got {text_response}, expected ACK {sequence_number})."
        )
        return False, True
    elif text_response == "INVALID":
        print(f"Received INVALID response for packet {packet_number}")
        return False, True
    else:
        print(
            f"Received unexpected response for packet {packet_number}: "
            f"{text_response}"
        )
        return False, True


def send_packets(
    sock: socket.socket,
    datagram: bytes,
    host: str,
    port: int,
    size: int,
    packet_number: int,
    sequence_number: int,
    max_retries: int,
) -> int:
    retries = 0

    while True:
        if not send_datagram(
            sock,
            datagram,
            host,
            port,
            packet_number,
            sequence_number,
            size,
            retries,
        ):
            continue

        text_response, should_retry = receive_response(sock, size)

        if text_response is None:
            if not should_retry:
                break
            retries += 1
            if retries >= max_retries:
                print(
                    f"Max retries reached for packet {packet_number}. "
                    f"Moving to next packet."
                )
                break
            else:
                print(
                    f"Timeout waiting for response for packet {packet_number}. "
                    f"Retrying (attempt {retries + 1})..."
                )
                continue

        valid, should_retry = validate_response(
            text_response, sequence_number, packet_number
        )

        if valid:
            return 1 - sequence_number

        retries += 1
        if retries >= max_retries:
            print(
                f"Max retries reached for packet {packet_number}. "
                f"Moving to next packet."
            )
            break
        else:
            print(
                f"Retrying packet {packet_number} (attempt {retries + 1})..."
            )
            continue

    return sequence_number


def main() -> None:
    args = parse_arguments()
    port = args.port
    host = args.host
    timeout = args.timeout
    size = args.size
    count = args.count
    max_retries = args.max_retries

    sequence_number = 0

    with create_socket(timeout) as sock:
        for packet_number in range(1, count + 1):
            try:
                datagram = create_datagram(size, sequence_number)
            except ValueError as e:
                print(f"Skipping packet {packet_number}: {e}")
                continue
            except OverflowError as e:
                print(f"Overflow error for packet {packet_number}: {e}")
                continue

            sequence_number = send_packets(
                sock,
                datagram,
                host,
                port,
                size,
                packet_number,
                sequence_number,
                max_retries,
            )


if __name__ == "__main__":
    main()
