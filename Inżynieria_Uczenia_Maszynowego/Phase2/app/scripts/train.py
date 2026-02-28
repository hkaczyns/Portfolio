import ast
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

BASE_DIR = Path(__file__).parent.parent.parent
DATA_PATH = BASE_DIR / "data" / "listings.csv"
MODEL_DIR = BASE_DIR / "app" / "models"
RANDOM_STATE = 999
TEST_SIZE = 0.2

AMENITIES = [
    "BBQ grill",
    "Dishwasher",
    "Pool",
    "Barbecue utensils",
    "Bathtub",
    "Free parking on premises",
    "Indoor fireplace",
    "Extra pillows and blankets",
    "Free street parking",
]


def convert_price(price: str) -> float:
    if isinstance(price, str):
        return float(price.replace("$", "").replace(",", ""))
    return price


def parse_amenities(amenities_str: str) -> list:
    if pd.isna(amenities_str):
        return []
    try:
        return ast.literal_eval(amenities_str)
    except (ValueError, SyntaxError):
        return []


def extract_amenities(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    amenities_list = df["amenities"].apply(parse_amenities)
    for amenity in AMENITIES:
        col_name = f"has_{amenity.lower().replace(' ', '_')}"
        df[col_name] = amenities_list.apply(lambda x: 1 if amenity in x else 0)
    df.drop(columns=["amenities"], inplace=True)
    return df


def load_data() -> pd.DataFrame:
    print("Loading data...")
    df = pd.read_csv(DATA_PATH)
    df["price_numeric"] = df["price"].apply(convert_price)
    df = df[df["price_numeric"].notna() & (df["price_numeric"] < 1500)].copy()

    print(f"Number of records after filtering: {len(df)}")
    print(f"Average price: {df['price_numeric'].mean():.2f}")
    print(f"Median price: {df['price_numeric'].median():.2f}")
    df = extract_amenities(df)
    return df


def baseline_model() -> tuple[Pipeline, list]:
    num_cols = ["accommodates", "bedrooms", "beds", "bathrooms"]
    cat_cols = [
        "room_type",
        "property_type",
        "neighbourhood_cleansed",
        "host_is_superhost",
    ]

    num_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
        ]
    )

    cat_pipe = Pipeline(
        [
            ("imputer", SimpleImputer(strategy="most_frequent")),
            (
                "ohe",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
            ),
        ]
    )

    preprocess = ColumnTransformer(
        transformers=[
            ("num", num_pipe, num_cols),
            ("cat", cat_pipe, cat_cols),
        ]
    )

    linreg_model = Pipeline(
        steps=[("prep", preprocess), ("model", LinearRegression())]
    )

    return linreg_model, num_cols + cat_cols


def advanced_model() -> tuple[Pipeline, list]:
    num_cols = ["accommodates", "bedrooms", "beds", "bathrooms"]
    cat_cols = [
        "room_type",
        "property_type",
        "neighbourhood_cleansed",
        "host_is_superhost",
    ]
    amenity_cols = [
        f"has_{amenity.lower().replace(' ', '_')}" for amenity in AMENITIES
    ]

    num_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
        ]
    )

    cat_pipe = Pipeline(
        [
            ("imputer", SimpleImputer(strategy="most_frequent")),
            (
                "ohe",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
            ),
        ]
    )
    amenity_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="constant", fill_value=0)),
        ]
    )

    preprocess = ColumnTransformer(
        transformers=[
            ("num", num_pipe, num_cols),
            ("cat", cat_pipe, cat_cols),
            ("amenity", amenity_pipe, amenity_cols),
        ]
    )

    rf_model = Pipeline(
        steps=[
            ("prep", preprocess),
            (
                "model",
                RandomForestRegressor(
                    n_estimators=200,
                    max_depth=20,
                    min_samples_leaf=5,
                    min_samples_split=10,
                    random_state=RANDOM_STATE,
                    n_jobs=-1,
                ),
            ),
        ]
    )
    return rf_model, num_cols + cat_cols + amenity_cols


def evaluate_model(
    model: Pipeline, X_test: pd.DataFrame, y_test: pd.Series, model_name: str
) -> dict:
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    mean_price = y_test.mean()

    print(f"Evaluation Metrics for {model_name}:")
    print(
        f"Mean Absolute Error: {mae:.2f} ({(mae / mean_price) * 100:.2f}% of mean price)"
    )
    print(f"Root Mean Squared Error: {rmse:.2f}")
    print(f"R^2 Score: {r2:.4f}")

    return {"mae": mae, "rmse": rmse, "r2": r2}


def tune_random_forest(
    X_train: pd.DataFrame, y_train: pd.Series, preprocess: ColumnTransformer
) -> Pipeline:
    print("Tuning random forest hyperparameters...")

    pipeline = Pipeline(
        steps=[
            ("prep", preprocess),
            (
                "model",
                RandomForestRegressor(random_state=RANDOM_STATE, n_jobs=-1),
            ),
        ]
    )

    param_grid = {
        "model__n_estimators": [100, 200],
        "model__max_depth": [15, 20, 25],
        "model__min_samples_leaf": [3, 5, 10],
        "model__min_samples_split": [5, 10],
    }

    grid_search = GridSearchCV(
        estimator=pipeline,
        param_grid=param_grid,
        cv=3,
        n_jobs=-1,
        scoring="neg_mean_absolute_error",
        verbose=2,
    )

    grid_search.fit(X_train, y_train)

    print(f"Best parameters: {grid_search.best_params_}")
    print(f"Best MAE: {-grid_search.best_score_:.2f}")

    return grid_search.best_estimator_


def main():
    df = load_data()
    y = df["price_numeric"].copy()

    print("Training baseline model...")
    baseline_pipe, baseline_cols = baseline_model()
    X_baseline = df[baseline_cols].copy()

    X_train_b, X_test_b, y_train_b, y_test_b = train_test_split(
        X_baseline, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    baseline_pipe.fit(X_train_b, y_train_b)
    baseline_metrics = evaluate_model(
        baseline_pipe, X_test_b, y_test_b, "Baseline Linear Regression"
    )

    print("Training advanced random forest model...")

    advanced_pipe, advanced_cols = advanced_model()
    X_advanced = df[advanced_cols].copy()
    X_train_a, X_test_a, y_train_a, y_test_a = train_test_split(
        X_advanced, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    tuned_rf_model = tune_random_forest(
        X_train_a, y_train_a, advanced_pipe.named_steps["prep"]
    )
    advanced_metrics = evaluate_model(
        tuned_rf_model, X_test_a, y_test_a, "Tuned Random Forest"
    )

    print("Saving models...")
    MODEL_DIR.mkdir(exist_ok=True)

    baseline_model_path = MODEL_DIR / "baseline_model.pkl"
    with open(baseline_model_path, "wb") as f:
        pickle.dump(baseline_pipe, f)
    print(f"Baseline model saved to {baseline_model_path}")

    advanced_model_path = MODEL_DIR / "advanced_model.pkl"
    with open(advanced_model_path, "wb") as f:
        pickle.dump(tuned_rf_model, f)
    print(f"Advanced model saved to {advanced_model_path}")

    metadata = {
        "baseline": {
            "features": baseline_cols,
            "metrics": baseline_metrics,
            "model_type": "LinearRegression",
        },
        "advanced": {
            "features": advanced_cols,
            "metrics": advanced_metrics,
            "model_type": "RandomForestRegressor",
            "amenities_tracked": AMENITIES,
        },
    }

    metadata_path = MODEL_DIR / "model_metadata.pkl"
    with open(metadata_path, "wb") as f:
        pickle.dump(metadata, f)
    print(f"Model metadata saved to {metadata_path}")

    print("Training complete.\nSummary of results:")
    print("Baseline Model Metrics:")
    print(f"  MAE: {baseline_metrics['mae']:.2f}")
    print(f"  RMSE: {baseline_metrics['rmse']:.2f}")
    print(f"  R^2: {baseline_metrics['r2']:.4f}")
    print("Advanced Model Metrics:")
    print(f"  MAE: {advanced_metrics['mae']:.2f}")
    print(f"  RMSE: {advanced_metrics['rmse']:.2f}")
    print(f"  R^2: {advanced_metrics['r2']:.4f}")


if __name__ == "__main__":
    main()
