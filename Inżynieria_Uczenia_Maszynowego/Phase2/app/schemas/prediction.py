from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class PredictionInput(BaseModel):
    accommodates: int = Field(
        ...,
        ge=1,
        le=20,
        description="Number of guests the property can accommodate",
    )
    bedrooms: float | None = Field(
        default=None,
        ge=0,
        le=20,
        description="Number of bedrooms in the property",
    )
    beds: float | None = Field(
        default=None,
        ge=0,
        le=30,
        description="Number of beds in the property",
    )
    bathrooms: float | None = Field(
        default=None,
        ge=0,
        le=20,
        description="Number of bathrooms in the property",
    )
    room_type: str = Field(
        ...,
        description="Type of room being offered (e.g., Entire home/apt, Private room)",
    )
    property_type: str = Field(
        ...,
        description="Type of property (e.g., 'Entire villa', 'Entire home')",
    )
    neighbourhood_cleansed: str = Field(
        ...,
        description="Name of the neighbourhood where the property is located",
    )
    host_is_superhost: str | None = Field(
        default=None,
        description="Indicates if the host is a superhost ('t' for true, 'f' for false)",
    )
    amenities: str | None = Field(
        default=None,
        description="Comma-separated list of amenities provided by the property (e.g., 'Pool,BBQ grill,Dishwasher')",
    )

    @field_validator("room_type")
    @classmethod
    def validate_room_type(cls, v):
        valid_types = [
            "Entire home/apt",
            "Private room",
            "Shared room",
            "Hotel room",
        ]
        if v not in valid_types:
            for vt in valid_types:
                if vt.lower() == v.lower():
                    return vt
            raise ValueError(
                f"Invalid room_type: {v}. Must be one of {valid_types}."
            )
        return v

    @field_validator("host_is_superhost")
    @classmethod
    def validate_superhost(cls, v):
        if v is None:
            return None
        if v.lower() in ["t", "true", "yes"]:
            return "t"
        elif v.lower() in ["f", "false", "no"]:
            return "f"
        else:
            raise ValueError("host_is_superhost must be 't' or 'f'")
        return v


class PredictionResponse(BaseModel):
    prediction_id: UUID = Field(
        ...,
        description="Unique identifier for the prediction request",
    )
    predicted_price: float = Field(
        ...,
        ge=0,
        description="Predicted price for the property per night in USD",
    )


class SetPriceInput(BaseModel):
    prediction_id: UUID = Field(
        ...,
        description="Unique identifier for the prediction request",
    )
    actual_price: float = Field(
        ...,
        ge=0,
        description="Actual price set by the host for the property per night in USD",
    )


class SetPriceResponse(BaseModel):
    prediction_id: UUID = Field(
        ...,
        description="Unique identifier for the prediction request",
    )
    predicted_price: float = Field(
        ...,
        ge=0,
        description="Predicted price for the property per night in USD",
    )
    actual_price: float = Field(
        ...,
        ge=0,
        description="Actual price set by the host for the property per night in USD",
    )
    error: float = Field(
        ...,
        description="Absolute error between predicted and actual price",
    )


class ModelMetrics(BaseModel):
    model_type: str = Field(
        ...,
        description="Type of the model (e.g., 'baseline', 'advanced')",
    )
    num_predictions: int = Field(
        ...,
        ge=0,
        description="Number of predictions made by the model",
    )
    num_evaluated: int = Field(
        ...,
        ge=0,
        description="Number of predictions that have actual prices for evaluation",
    )
    mae: float | None = Field(
        None,
        ge=0,
        description="Mean Absolute Error of the model's predictions",
    )
    rmse: float | None = Field(
        None,
        ge=0,
        description="Root Mean Squared Error of the model's predictions",
    )
    r2: float | None = Field(
        None,
        description="R^2 Score of the model's predictions",
    )
    mean_predicted_price: float | None = Field(
        None,
        ge=0,
        description="Mean of the predicted prices",
    )
    mean_actual_price: float | None = Field(
        None,
        ge=0,
        description="Mean of the actual prices",
    )


class ABTestResults(BaseModel):
    total_predictions: int = Field(
        ...,
        ge=0,
        description="Total number of predictions made during the A/B test",
    )
    total_evaluated: int = Field(
        ...,
        ge=0,
        description="Total number of predictions that have actual prices for evaluation",
    )
    baseline: ModelMetrics = Field(
        ...,
        description="Metrics for the baseline model",
    )
    advanced: ModelMetrics = Field(
        ...,
        description="Metrics for the advanced model",
    )
