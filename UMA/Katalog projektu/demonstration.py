import numpy as np
import pandas as pd
from IReppp import IRepppClassifier, COLUMN_NAMES

def train_test_split(X, y, test_size=0.2):
    """
    Funkcja pomocnicza dzieli dane losowo na zbiór treningowy i testowy
    """
    n = len(X)
    indices = np.random.permutation(n)
    test_size_count = int(n * test_size)
    
    test_indices = indices[:test_size_count]
    train_indices = indices[test_size_count:]
    
    if isinstance(X, pd.DataFrame):
        X_train = X.iloc[train_indices].reset_index(drop=True)
        X_test = X.iloc[test_indices].reset_index(drop=True)
    else:
        X_train = X[train_indices]
        X_test = X[test_indices]
    
    if isinstance(y, pd.Series):
        y_train = y.iloc[train_indices].reset_index(drop=True)
        y_test = y.iloc[test_indices].reset_index(drop=True)
    else:
        y_train = y[train_indices]
        y_test = y[test_indices]
    
    return X_train, X_test, y_train, y_test

def calculate_accuracy(y_true, y_pred):
    """
    Funkcja pomocnicza obliczająca dokładność
    """
    return np.sum(y_true == y_pred) / len(y_true)

def calculate_precision(y_true, y_pred):
    """
    Funkcja pomocnicza obliczająca precyzję
    """
    true_positives = np.sum((y_pred == True) & (y_true == True))
    predicted_positives = np.sum(y_pred == True)
    return true_positives / predicted_positives

def calculate_recall(y_true, y_pred):
    """
    Funkcja pomocnicza obliczająca czułość
    """
    true_positives = np.sum((y_pred == True) & (y_true == True))
    actual_positives = np.sum(y_true == True)
    return true_positives / actual_positives

if __name__ == "__main__":

    print("\nPrezentacja działania klasyfikatora IRep++ (20% danych testowych)\n")

    # Wczytanie danych
    df = pd.read_csv('wdbc.csv', header=None, names=COLUMN_NAMES)

    # Przygotowanie danych
    X = df.drop(['ID', 'Diagnosis'], axis=1)
    y = (df['Diagnosis'] == 'M')  # Malignant (M) = True, Benign (B) = False

    # Podział na zbiór treningowy i testowy
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, 
        test_size=0.2,
    )

    # Trening
    clf = IRepppClassifier(max_bad_rules=5)
    clf.fit(X_train, y_train)

    # Wyświetlenie reguł
    print("=" * 80)
    clf.print_rules()
    print("=" * 80)

    # Predykcja
    y_pred = clf.predict(X_test)

    # Obliczenie wyników
    correct = np.sum(y_pred == y_test)
    incorrect = np.sum(y_pred != y_test)
    total = len(y_test)
    accuracy = calculate_accuracy(y_test, y_pred)
    precision = calculate_precision(y_test, y_pred)
    recall = calculate_recall(y_test, y_pred)

    print(f"\nWyniki na zbiorze testowym ({total} przykładów):")
    print(f"Poprawne predykcje: {correct}")
    print(f"Błędne predykcje: {incorrect}")
    print(f"Dokładność (Accuracy): {accuracy:.4f}")
    print(f"Precyzja (Precision): {precision:.4f}")
    print(f"Czułość (Recall): {recall:.4f}")
