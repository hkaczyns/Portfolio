import sys
import time
from typing import Optional, List, Tuple
import requests
import pandas as pd
from sklearn.model_selection import train_test_split

from train import (
    DATA_PATH,
    RANDOM_STATE,
    TEST_SIZE,
    AMENITIES,
    convert_price,
    parse_amenities,
)


BASE_URL = "http://localhost:8080"
LIMIT: int | None = None


def extract_tracked_amenities(amenities_list: List[str]) -> str:
    tracked = [am for am in AMENITIES if am in amenities_list]
    return ",".join(tracked) if tracked else ""


def load_test_data() -> Tuple[pd.DataFrame, pd.Series]:
    print("Loading data...")
    df = pd.read_csv(DATA_PATH, low_memory=False)
    df["price_numeric"] = df["price"].apply(convert_price)
    df = df[df["price_numeric"].notna() & (df["price_numeric"] < 1500)].copy()

    print(f"Number of records after filtering: {len(df)}")
    print(f"Average price: {df['price_numeric'].mean():.2f}")
    print(f"Median price: {df['price_numeric'].median():.2f}")
    amenities_list = df["amenities"].apply(parse_amenities)
    df["amenities_tracked"] = amenities_list.apply(extract_tracked_amenities)

    features = [
        "accommodates",
        "bedrooms",
        "beds",
        "bathrooms",
        "room_type",
        "property_type",
        "neighbourhood_cleansed",
        "host_is_superhost",
        "amenities_tracked",
    ]

    X = df[features].copy()
    y = df["price_numeric"].copy()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    print(f"Training set size: {len(X_train)}")
    return X_test, y_test


def check_api_health() -> bool:
    try:
        response = requests.get(f"{BASE_URL}/nocarz/health", timeout=5)
        return response.status_code == 200
    except Exception:
        return False


def call_predict(row: pd.Series) -> Optional[dict]:
    params = {
        "accommodates": int(row["accommodates"]),
        "room_type": row["room_type"],
        "property_type": row["property_type"],
        "neighbourhood_cleansed": row["neighbourhood_cleansed"],
    }

    if pd.notna(row["bedrooms"]):
        params["bedrooms"] = float(row["bedrooms"])
    if pd.notna(row["beds"]):
        params["beds"] = float(row["beds"])
    if pd.notna(row["bathrooms"]):
        params["bathrooms"] = float(row["bathrooms"])
    if pd.notna(row["host_is_superhost"]):
        params["host_is_superhost"] = row["host_is_superhost"]
    if row["amenities_tracked"]:
        params["amenities"] = row["amenities_tracked"]

    try:
        response = requests.get(
            f"{BASE_URL}/nocarz/predict", params=params, timeout=10
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error calling API: {e}")
        return None


def call_set_price(prediction_id: str, actual_price: float) -> dict | None:
    try:
        response = requests.post(
            f"{BASE_URL}/nocarz/set_price",
            json={
                "prediction_id": prediction_id,
                "actual_price": actual_price,
            },
            timeout=10,
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error calling set_price API: {e}")
        return None


def run_ab_test():
    if not check_api_health():
        print("API is not healthy. Exiting.")
        sys.exit(1)

    X_test, y_test = load_test_data()

    if LIMIT and LIMIT < len(X_test):
        X_test = X_test.head(LIMIT)
        y_test = y_test.head(LIMIT)

    start_time = time.time()

    for i, (idx, row) in enumerate(X_test.iterrows()):
        actual_price = y_test.at[idx]

        predict_response = call_predict(row)

        if predict_response is None:
            print(f"Skipping record {i} due to prediction error.")
            continue

        prediction_id = predict_response["prediction_id"]
        predicted_price = predict_response["predicted_price"]

        set_price_response = call_set_price(prediction_id, actual_price)

        if set_price_response is None:
            print(f"Skipping record {i} due to set_price error.")
            continue

        print(
            f"Record {i}: Actual Price = {actual_price:.2f}, Predicted Price = {predicted_price:.2f}"
        )
    elapsed_time = time.time() - start_time
    print(
        f"AB test completed in {elapsed_time:.2f} seconds ({elapsed_time/len(X_test):.2f} seconds per record)."
    )


def main():
    run_ab_test()


if __name__ == "__main__":
    main()
