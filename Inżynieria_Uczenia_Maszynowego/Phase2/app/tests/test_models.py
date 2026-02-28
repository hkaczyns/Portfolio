from services.model_service import ModelService, get_model_service


def test_model_service_singleton():
    service_instance_1 = get_model_service()
    service_instance_2 = get_model_service()
    assert service_instance_1 is service_instance_2


def test_baseline_model_loaded(model_service: ModelService):
    assert model_service.baseline_model is not None


def test_advanced_model_loaded(model_service: ModelService):
    assert model_service.advanced_model is not None


def test_models_are_pipelines(model_service: ModelService):
    from sklearn.pipeline import Pipeline

    assert isinstance(model_service.baseline_model, Pipeline)
    assert isinstance(model_service.advanced_model, Pipeline)


def test_predict_returns_str_float_tuple(
    model_service: ModelService, sample_listing_basic: dict
):
    result = model_service.predict_price(**sample_listing_basic)
    assert isinstance(result, tuple)
    assert len(result) == 2
    model_type, predicted_price = result
    assert isinstance(model_type, str)
    assert isinstance(predicted_price, float)


def test_predict_model_name_valid(
    model_service: ModelService, sample_listing_basic: dict
):
    model_type, _ = model_service.predict_price(**sample_listing_basic)
    assert model_type in ["baseline", "advanced"]


def test_predict_price_positive(
    model_service: ModelService, sample_listing_basic: dict
):
    _, predicted_price = model_service.predict_price(**sample_listing_basic)
    assert predicted_price > 0


def test_predict_with_amenities(
    model_service: ModelService, sample_listing_with_amenities: dict
):
    model_name, price = model_service.predict_price(
        **sample_listing_with_amenities
    )

    assert model_name in ["baseline", "advanced"]
    assert price >= 0


def test_predict_minimal_input(
    model_service: ModelService, sample_listing_minimal: dict
):
    model_name, price = model_service.predict_price(**sample_listing_minimal)

    assert model_name in ["baseline", "advanced"]
    assert price >= 0


def test_predict_luxury_listing(
    model_service: ModelService, sample_listing_luxury: dict
):
    _, luxury_price = model_service.predict_price(**sample_listing_luxury)

    assert luxury_price > 200


def test_model_selection_returns_valid_model(model_service: ModelService):
    model_name, model = model_service.select_model()
    assert model_name in ["baseline", "advanced"]
    assert model is not None


def test_parse_empty_amenities(model_service: ModelService):
    result = model_service._parse_amenities("")
    assert result == []


def test_parse_single_amenity(model_service: ModelService):
    result = model_service._parse_amenities("Pool")
    assert result == ["Pool"]


def test_parse_multiple_amenities(model_service: ModelService):
    result = model_service._parse_amenities("Pool,BBQ grill,Dishwasher")
    assert len(result) == 3
    assert "Pool" in result
    assert "BBQ grill" in result
    assert "Dishwasher" in result


def test_parse_amenities_with_spaces(model_service: ModelService):
    result = model_service._parse_amenities("Pool , BBQ grill , Dishwasher")
    assert len(result) == 3
    assert "Pool" in result
    assert "BBQ grill" in result


def test_advanced_features_amenity_values(model_service: ModelService):
    params = {
        "accommodates": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 1,
        "room_type": "Entire home/apt",
        "property_type": "Entire villa",
        "neighbourhood_cleansed": "Palma de Mallorca",
        "host_is_superhost": "t",
        "amenities": "Pool,BBQ grill",
    }

    df = model_service._prepare_advanced_features(**params)
    assert df["has_pool"].iloc[0] == 1
    assert df["has_bbq_grill"].iloc[0] == 1
    assert df["has_bathtub"].iloc[0] == 0
