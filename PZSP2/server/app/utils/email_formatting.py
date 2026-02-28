from app.models.payment import ChargeType
from app.models.schedule import ClassGroup


def _format_class_group_schedule(class_group: ClassGroup) -> str:
    day_names = {
        0: "poniedzia\u0142ek",
        1: "poniedzia\u0142ek",
        2: "wtorek",
        3: "\u015broda",
        4: "czwartek",
        5: "pi\u0105tek",
        6: "sobota",
        7: "niedziela",
    }
    start_time = class_group.start_time.strftime("%H:%M")
    end_time = class_group.end_time.strftime("%H:%M")
    day_label = day_names.get(class_group.day_of_week)
    if day_label:
        return f"{day_label}, {start_time}-{end_time}"
    return f"{start_time}-{end_time}"


def _format_charge_type(charge_type: ChargeType) -> str:
    labels = {
        ChargeType.MONTHLY_FEE: "Op\u0142ata miesi\u0119czna",
        ChargeType.ADDITIONAL_CLASSES: "Zaj\u0119cia dodatkowe",
        ChargeType.ADJUSTMENT: "Korekta",
    }
    return labels.get(charge_type, charge_type.value)
