from pydantic import ConfigDict
from pydantic.alias_generators import to_camel


class CamelCaseSchema:
    model_config = ConfigDict(
        alias_generator=to_camel,
        validate_by_name=True,
        from_attributes=True,
    )
