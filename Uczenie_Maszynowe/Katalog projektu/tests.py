import numpy as np
import pandas as pd
from IReppp import IRepppClassifier
from demonstration import train_test_split, calculate_accuracy, calculate_precision, calculate_recall

def test_foil_gain():
    """
    Test obliczania FOIL gain
    """
    clf = IRepppClassifier()
    
    gain = clf._foil_gain(10, 2, 20, 10)
    assert gain > 0, "Typowy FOIL gain powinien być > 0"
    
    gain = clf._foil_gain(0, 5, 10, 10)
    assert gain == -float('inf'), "Gain dla p=0 powinien być -inf"
    
    # Dzielenie przez zero
    gain = clf._foil_gain(0, 0, 10, 10)
    assert gain == -float('inf'), "Gain dla p=0 i n=0 powinien być -inf"

    # Dzielenie przez zero
    gain = clf._foil_gain(10, 2, 0, 0)
    assert gain == -float('inf'), "Gain dla p0=0 i n0=0 powinien być -inf"
    
    print("test_foil_gain udany")

def test_split():
    """
    Test podziału danych
    """
    clf = IRepppClassifier(grow_ratio=2/3)
    data = np.random.rand(100, 5)
    
    grow, prune = clf._split(data)
    
    assert len(grow) + len(prune) == len(data), "Suma zbiorów powinna równać się całości"
    assert 65 < len(grow) < 68, "Zbiór rosnący powinien być ~66 elementów dla 100 próbek"
    
    print("test_split udany")

def test_literal_covers():
    """
    Test pokrycia przez literal (warunek)
    """
    clf = IRepppClassifier()
    X = np.array([[1.0], [2.0], [3.0], [4.0], [5.0]])
    
    literal_less = {'feature': 0, 'operator': '<', 'value': 3.5}
    covered = clf._literal_covers(literal_less, X)
    
    assert np.sum(covered) == 3, "Literal < 3.5 powinien pokryć 3 przykłady"
    
    literal_greater = {'feature': 0, 'operator': '>', 'value': 3.5}
    covered = clf._literal_covers(literal_greater, X)
    
    assert np.sum(covered) == 2, "Literal > 3.5 powinien pokryć 2 przykłady"
    
    print("test_literal_covers udany")

def test_rule_covers():
    """
    Test pokrycia przez regułę
    """
    clf = IRepppClassifier()
    X = np.array([[1.0, 5.0], [2.0, 6.0], [3.0, 7.0], [4.0, 8.0]])
    
    rule = [
        {'feature': 0, 'operator': '>', 'value': 1.5},
        {'feature': 1, 'operator': '<', 'value': 7.5}
    ]
    
    covered = clf._rule_covers(rule, X)
    assert np.sum(covered) == 2, "Reguła powinna pokryć 2 przykłady"
    
    print("test_rule_covers udany")

def test_empty_rule():
    """
    Test pustej reguły
    """
    clf = IRepppClassifier()
    X = np.array([[1.0], [2.0], [3.0]])
    
    covered = clf._rule_covers([], X)
    assert np.sum(covered) == 0, "Pusta reguła nie powinna nic pokrywać"
    
    print("test_empty_rule udany")

def test_keep():
    """
    Test decyzji o zachowaniu reguły
    """
    clf = IRepppClassifier()
    
    # Więcej pozytywnych niż negatywnych - zachowaj
    data = np.array([
        [1.0, True],
        [2.0, True],
        [3.0, True],
        [4.0, False]
    ])
    
    rule = [{'feature': 0, 'operator': '>', 'value': 0.5}]
    assert clf._keep(rule, data) == True, "Reguła pokrywająca więcej pozytywnych powinna być zachowana"
    
    # Więcej negatywnych - odrzuć
    data = np.array([
        [1.0, True],
        [2.0, False],
        [3.0, False],
        [4.0, False]
    ])
    
    assert clf._keep(rule, data) == False, "Reguła pokrywająca więcej negatywnych powinna być odrzucona"
    
    print("test_keep udany")

def test_fit_predict():
    """
    Test podstawowego uczenia i predykcji
    """
    # Proste dane - wszystkie x > 5 są pozytywne
    X = np.array([[1.0], [3.0], [6.0], [8.0], [10.0]])
    y = np.array([False, False, True, True, True])
    
    clf = IRepppClassifier(max_bad_rules=3)
    clf.fit(X, y)
    
    assert len(clf.rules) > 0, "Dla prostego przykładu powinny być nauczone jakieś reguły"
    
    predictions = clf.predict(X)
    accuracy = np.sum(predictions == y) / len(y)
    
    assert accuracy == 1, "Dla prostego przykładu dokładność powinna być 100%"
    
    print("test_fit_predict udany")

def test_not_covered():
    """
    Test usuwania pokrytych przykładów
    """
    clf = IRepppClassifier()
    
    data = np.array([
        [1.0, True],
        [2.0, False],
        [3.0, True],
        [4.0, False]
    ])
    
    rule = [{'feature': 0, 'operator': '<', 'value': 2.5}]
    remaining = clf._not_covered(rule, data)
    
    assert len(remaining) == 2, "Po usuwaniu powinny pozostać 2 niepokryte przykłady"
    
    print("test_not_covered udany")

def test_calculate_precision():
    """
    Test obliczania precyzji reguły
    """
    clf = IRepppClassifier()
    
    X = np.array([[1.0], [2.0], [3.0], [4.0]])
    y = np.array([True, True, False, False])
    
    rule = [{'feature': 0, 'operator': '<', 'value': 2.5}]
    precision = clf._calculate_precision(rule, X, y)
    
    assert precision == 1.0, "Precyzja powinna być 1.0 (2 pozytywne, 0 negatywnych pokrytych)"
    
    print("test_calculate_precision udany")

def test_find_split():
    """
    Test znajdowania optymalnego podziału
    """
    clf = IRepppClassifier()
    
    grow_set = np.array([
        [1.0, False],
        [2.0, False],
        [3.0, True],
        [4.0, True],
        [5.0, True]
    ])
    
    split = clf._find_split(0, grow_set)
    
    assert split is not None, "Powinien znaleźć podział"
    assert split['feature'] == 0, "Podział dla cechy 0"
    assert split['gain'] > 0, "FOIL gain powinien być dodatni"
    
    print("test_find_split udany")

def test_prune_rule():
    """
    Test przycinania reguły
    """
    clf = IRepppClassifier()
    
    # Zbiór przycinający
    prune_set = np.array([
        [1.0, 5.0, True],
        [2.0, 6.0, True],
        [3.0, 7.0, False],
        [4.0, 8.0, False]
    ])
    
    # Reguła z 2 warunkami (zbyt szczegółowa)
    rule = [
        {'feature': 0, 'operator': '<', 'value': 3.5},
        {'feature': 1, 'operator': '<', 'value': 6.5}
    ]
    
    pruned = clf._prune_rule(rule, prune_set)
    
    assert len(pruned) <= len(rule), "Przycięta reguła powinna mieć <= warunków"
    assert len(pruned) > 0, "Nie powinno zwrócić pustej reguły"
    
    print("test_prune_rule udany")

def test_dataframe_vs_numpy():
    """
    Test obsługi DataFrame i numpy array
    """
    X_np = np.array([[1.0], [3.0], [6.0], [8.0], [10.0]])
    y_np = np.array([False, False, True, True, True])
    
    X_df = pd.DataFrame(X_np, columns=['feature1'])
    y_df = pd.Series(y_np)
    
    # Test z numpy
    clf1 = IRepppClassifier(max_bad_rules=3)
    clf1.fit(X_np, y_np)
    pred1 = clf1.predict(X_np)
    
    # Test z DataFrame
    clf2 = IRepppClassifier(max_bad_rules=3)
    clf2.fit(X_df, y_df)
    pred2 = clf2.predict(X_df)
    
    assert len(clf1.rules) > 0, "Powinny być reguły dla numpy"
    assert len(clf2.rules) > 0, "Powinny być reguły dla DataFrame"
    assert clf2.feature_names == ['feature1'], "Nazwy cech z DataFrame powinny być zachowane"
    
    print("test_dataframe_vs_numpy udany")

def test_no_errors_on_grow_set():
    """
    Test logiki stopu - brak błędów na grow_set
    """
    clf = IRepppClassifier()
    
    # Tylko pozytywne przykłady - reguła pusta nie powinna mieć błędów
    grow_set_pos = np.array([
        [1.0, True],
        [2.0, True],
        [3.0, True]
    ])
    
    assert clf._no_errors_on_grow_set([], grow_set_pos) == True, "Brak błędów dla samych pozytywnych"
    
    # Mieszane - pusta reguła ma błędy
    grow_set_mixed = np.array([
        [1.0, True],
        [2.0, False],
        [3.0, True]
    ])
    
    assert clf._no_errors_on_grow_set([], grow_set_mixed) == False, "Są błędy dla mieszanych"
    
    # Reguła pokrywająca tylko pozytywne
    rule = [{'feature': 0, 'operator': '>', 'value': 1.5}]
    grow_set = np.array([
        [1.0, False],
        [2.0, True],
        [3.0, True]
    ])
    
    assert clf._no_errors_on_grow_set(rule, grow_set) == True, "Reguła nie pokrywa negatywnych"
    
    print("test_no_errors_on_grow_set udany")

def test_train_test_split_numpy():
    """
    Test podziału danych dla numpy array
    """
    X = np.array([[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]])
    y = np.array([0, 1, 0, 1, 0, 1, 0, 1, 0, 1])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    
    assert len(X_train) == 8, "Zbiór treningowy powinien mieć 8 przykładów"
    assert len(X_test) == 2, "Zbiór testowy powinien mieć 2 przykłady"
    assert len(y_train) == 8, "y_train powinien mieć 8 etykiet"
    assert len(y_test) == 2, "y_test powinien mieć 2 etykiety"
    assert len(X_train) + len(X_test) == len(X), "Suma zbiorów równa całości"
    
    print("test_train_test_split_numpy udany")

def test_train_test_split_dataframe():
    """
    Test podziału danych dla DataFrame
    """
    X = pd.DataFrame({'a': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]})
    y = pd.Series([0, 1, 0, 1, 0, 1, 0, 1, 0, 1])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3)
    
    assert len(X_train) == 7, "Zbiór treningowy powinien mieć 7 przykładów"
    assert len(X_test) == 3, "Zbiór testowy powinien mieć 3 przykłady"
    assert isinstance(X_train, pd.DataFrame), "X_train powinien być DataFrame"
    assert isinstance(y_train, pd.Series), "y_train powinien być Series"
    assert list(X_train.index) == list(range(len(X_train))), "Indeksy powinny być zresetowane"
    
    print("test_train_test_split_dataframe udany")

def test_calculate_accuracy():
    """
    Test obliczania accuracy
    """
    y_true = np.array([True, True, False, False, True])
    y_pred = np.array([True, False, False, True, True])
    
    acc = calculate_accuracy(y_true, y_pred)
    
    assert acc == 0.6, f"Accuracy powinno być 0.6 (3/5 poprawnych), jest {acc}"
    
    y_pred_perfect = np.array([True, True, False, False, True])
    acc_perfect = calculate_accuracy(y_true, y_pred_perfect)
    
    assert acc_perfect == 1.0, f"Perfekcyjne accuracy powinno być 1.0, jest {acc_perfect}"
    
    print("test_calculate_accuracy udany")

def test_calculate_precision():
    """
    Test obliczania precision
    """
    y_true = np.array([True, True, False, False, True])
    y_pred = np.array([True, False, False, True, True])
    
    # True Positives: 2 (indeks 0, 4)
    # Predicted Positives: 3 (indeks 0, 3, 4)
    # Precision = 2/3
    
    prec = calculate_precision(y_true, y_pred)
    
    assert abs(prec - 2/3) < 0.001, f"Precision powinno być 2/3, jest {prec}"
    
    y_pred_perfect = np.array([True, True, False, False, False])
    prec_perfect = calculate_precision(y_true, y_pred_perfect)
    
    assert prec_perfect == 1.0, f"Perfekcyjne precision powinno być 1.0, jest {prec_perfect}"
    
    print("test_calculate_precision udany")

def test_calculate_recall():
    """
    Test obliczania recall
    """
    y_true = np.array([True, True, False, False, True])
    y_pred = np.array([True, False, False, True, True])
    
    # True Positives: 2 (indeks 0, 4)
    # Actual Positives: 3 (indeks 0, 1, 4)
    # Recall = 2/3
    
    rec = calculate_recall(y_true, y_pred)
    
    assert abs(rec - 2/3) < 0.001, f"Recall powinno być 2/3, jest {rec}"
    
    # Test perfect recall
    y_pred_perfect = np.array([True, True, True, True, True])
    rec_perfect = calculate_recall(y_true, y_pred_perfect)
    
    assert rec_perfect == 1.0, f"Perfekcyjne recall powinno być 1.0, jest {rec_perfect}"
    
    print("test_calculate_recall udany")

# Uruchomienie wszystkich testów
if __name__ == "__main__":

    print("\nUruchamianie testów\n")
    
    try:
        test_foil_gain()
        test_split()
        test_literal_covers()
        test_rule_covers()
        test_empty_rule()
        test_keep()
        test_fit_predict()
        test_not_covered()
        test_calculate_precision()
        test_find_split()
        test_prune_rule()
        test_dataframe_vs_numpy()
        test_no_errors_on_grow_set()
        test_train_test_split_numpy()
        test_train_test_split_dataframe()
        test_calculate_accuracy()
        test_calculate_precision()
        test_calculate_recall()
        
        print("\nWszystkie testy udane!")
    except AssertionError as e:
        print(f"\nTest nieudany: {e}")
    except Exception as e:
        print(f"\nBłąd: {e}")