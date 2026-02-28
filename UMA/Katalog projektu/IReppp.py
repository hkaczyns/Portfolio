import numpy as np
import pandas as pd
import math

COLUMN_NAMES = [
    'ID', 'Diagnosis',
    'radius1', 'texture1', 'perimeter1', 'area1', 'smoothness1', 
    'compactness1', 'concavity1', 'concave_points1', 'symmetry1', 'fractal_dimension1',
    'radius2', 'texture2', 'perimeter2', 'area2', 'smoothness2',
    'compactness2', 'concavity2', 'concave_points2', 'symmetry2', 'fractal_dimension2',
    'radius3', 'texture3', 'perimeter3', 'area3', 'smoothness3',
    'compactness3', 'concavity3', 'concave_points3', 'symmetry3', 'fractal_dimension3'
]

class IRepppClassifier:
    """
    Klasa główna IRep++ klasyfikatora binarnego 
    """
    def __init__(self, max_bad_rules=5, grow_ratio=2/3):
        """
        Metoda inicjalizująca klasyfikator
        max_bad_rules: maksymalna liczba kolejnych odrzuconych reguł (kryterium stopu)
        """
        self.rules = []
        self.max_bad_rules = max_bad_rules
        self.feature_names = []
        self.grow_ratio = grow_ratio  # domyślny stosunek grow/prune
        
    def fit(self, X, y):
        """
        Metoda treningu algorytmu
        Formatuje dane wejściowe i uruchamia główną pętlę uczenia
        X - zbiór cech
        y - etykiety klas (True/False - Malignant/Benign)
        """
        if isinstance(X, pd.DataFrame):
            self.feature_names = list(X.columns)
            X = X.values
        else:
            self.feature_names = [f"Feature_{i}" for i in range(X.shape[1])]
            
        X = np.array(X, dtype=float) # cechy jako float
        y = np.array(y, dtype=bool) # etykiety jako bool
        
        training_data = np.column_stack([X, y])
        self.rules = self._learn(training_data)
        return self
    
    def _learn(self, training_data):
        """
        Główna pętla uczenia
        Dzieli dane na zbiór rosnący i przycinający
        Tworzy, przycina i ocenia reguły
        """
        rule_set = []
        bad_rule_count = 0
        
        while bad_rule_count < self.max_bad_rules:
            if len(training_data) == 0:
                print("Brak danych treningowych, kończę uczenie.")
                break
                
            grow_set, prune_set = self._split(training_data)
            
            if len(grow_set) == 0 or len(prune_set) == 0:
                print("Zbiór rosnący lub przycinający jest pusty, kończę uczenie.")
                break
                
            new_rule = self._grow_rule(grow_set)
            new_rule = self._prune_rule(new_rule, prune_set)
            
            if self._keep(new_rule, training_data):
                rule_set.append(new_rule)
                training_data = self._not_covered(new_rule, training_data)
                bad_rule_count = 0
            else:
                bad_rule_count += 1
                
        return rule_set
    
    def _split(self, training_data):
        """
        Metoda dzieląca losowo dane na zbiór rosnący i przycinający - proporcja 2:1
        """
        n = len(training_data)
        indices = np.random.permutation(n)
        split_point = int(n * self.grow_ratio)
        
        grow_indices = indices[:split_point]
        prune_indices = indices[split_point:]
        
        return training_data[grow_indices], training_data[prune_indices]
    
    def _grow_rule(self, grow_set):
        """
        Metoda tworząca regułę iteracyjnie dodając warunki
        Zaczyna od pustej reguły i dodaje najlepszy podział
        Usuwa pokryte przez nowy warunek przykłady z rozważanych danych
        Kontynuuje aż reguła nie popełnia błędów na zbiorze rosnącym
        """
        new_rule = []
        current_grow_set = grow_set.copy()
        
        while not self._no_errors_on_grow_set(new_rule, current_grow_set):
            global_best_split = None
            best_gain = -float('inf')
            
            n_features = current_grow_set.shape[1] - 1
            
            for feature_idx in range(n_features):
                new_split = self._find_split(feature_idx, current_grow_set)
                
                if new_split is not None and new_split['gain'] > best_gain:
                    best_gain = new_split['gain']
                    global_best_split = new_split
            
            if global_best_split is None:
                break
                
            new_rule.append(global_best_split)
            current_grow_set = self._not_covered_by_literal(global_best_split, current_grow_set)
            
        return new_rule
    
    def _find_split(self, feature_idx, grow_set):
        """
        Metoda znajdująca najlepszy podział dla danej cechy
        Sortuje wartości cechy i dla każdej pary sąsiednich różnych wartości oblicza punkt podziału
        Testuje dla punktu operatory < i > oraz oblicza przyrost informacji FOIL
        Zwraca podział z największym przyrostem
        """
        X = grow_set[:, :-1]
        y = grow_set[:, -1]
        
        feature_values = X[:, feature_idx]
    
        sorted_indices = np.argsort(feature_values)
        sorted_values = feature_values[sorted_indices]
        sorted_y = y[sorted_indices]
        
        best_split = None
        best_gain = -float('inf')
        
        p_total = np.sum(sorted_y == True)
        n_total = np.sum(sorted_y == False)
        
        if p_total == 0:
            return None
        
        for i in range(len(sorted_values) - 1):
            if sorted_values[i] == sorted_values[i + 1]:
                continue
                
            split_value = (sorted_values[i] + sorted_values[i + 1]) / 2
            
            # Test operatora <
            mask = feature_values < split_value
            p = np.sum((y == True) & mask)
            n = np.sum((y == False) & mask)
            
            if p + n > 0:
                gain = self._foil_gain(p, n, p_total, n_total)
                if gain > best_gain:
                    best_gain = gain
                    best_split = {
                        'feature': feature_idx,
                        'operator': '<',
                        'value': split_value,
                        'gain': gain
                    }
            
            # Test operatora >
            mask = feature_values > split_value
            p = np.sum((y == True) & mask)
            n = np.sum((y == False) & mask)
            
            if p + n > 0:
                gain = self._foil_gain(p, n, p_total, n_total)
                if gain > best_gain:
                    best_gain = gain
                    best_split = {
                        'feature': feature_idx,
                        'operator': '>',
                        'value': split_value,
                        'gain': gain
                    }
        
        return best_split
    
    def _foil_gain(self, p, n, p0, n0):
        """
        Metoda obliczająca przyrost informacji FOIL
        Wzór: p * (log₂(p/(p+n)) - log₂(p0/(p0+n0)))
        gdzie:
        p, n - liczba pozytywnych i negatywnych przykładów pokrytych przez regułę z nowym warunkiem
        p0, n0 - liczba pozytywnych i negatywnych przykładów pokrytych przez regułę przed dodaniem warunku
        """
        if p == 0 or p + n == 0 or p0 + n0 == 0:
            return -float('inf')
        
        log_new = math.log2(p / (p + n))
        log_old = math.log2(p0 / (p0 + n0))
        
        return p * (log_new - log_old)
    
    def _prune_rule(self, rule, prune_set):
        """
        Metoda przycinająca regułę
        Testuje dokładność na zbiorze przycinającym dla kolejnych wersji reguły
        Usuwa warunki, które poprawiają lub nie pogarszają dokładności
        Zwraca przyciętą regułę, nigdy nie akceptuje pustej reguły
        """
        if len(rule) == 0:
            return rule
        
        X_prune = prune_set[:, :-1]
        y_prune = prune_set[:, -1]
        
        best_rule = rule.copy()
        best_accuracy = self._calculate_precision(rule, X_prune, y_prune)
        
        for i in range(len(rule) - 1, -1, -1):
            pruned_rule = rule[:i]
            
            if len(pruned_rule) == 0:
                continue
            
            accuracy = self._calculate_precision(pruned_rule, X_prune, y_prune)
            
            if accuracy > best_accuracy or (accuracy == best_accuracy and len(pruned_rule) < len(best_rule)):
                best_accuracy = accuracy
                best_rule = pruned_rule
        
        return best_rule
    
    def _calculate_precision(self, rule, X, y):
        """
        Metoda obliczająca dokładność reguły na danych
        Dokładność = liczba poprawnie sklasyfikowanych przykładów / liczba wszystkich przykładów
        """
        if len(rule) == 0:
            print("Reguła jest pusta, dokładność wynosi 0")
            return 0.0
        
        covered = self._rule_covers(rule, X)
        
        if np.sum(covered) == 0:     
            return 0.0
        
        p = np.sum((y == True) & covered)
        n = np.sum((y == False) & covered)
        
        if p + n == 0:
            print("Reguła nie pokrywa żadnych przykładów, dokładność wynosi 0")
            return 0.0
        
        return p / (p + n)
    
    def _keep(self, rule, training_data):
        """
        Metoda oceniająca czy reguła powinna zostać zachowana
        Reguła jest zachowana jeśli pokrywa więcej pozytywnych niż negatywnych przykładów
        """
        if len(rule) == 0:
            return False
        
        X = training_data[:, :-1]
        y = training_data[:, -1]
        
        covered = self._rule_covers(rule, X)
        p = np.sum((y == True) & covered)
        n = np.sum((y == False) & covered)
        
        return p > n
    
    def _no_errors_on_grow_set(self, rule, grow_set):
        """
        Metoda sprawdzająca, czy reguła nie popełnia błędów na zbiorze rosnącym
        Reguła nie popełnia błędów jeśli nie pokrywa żadnych negatywnych przykładów
        """
        if len(grow_set) == 0:
            print("Zbiór rosnący jest pusty, reguła nie popełnia błędów.")
            return True
        
        X = grow_set[:, :-1]
        y = grow_set[:, -1]
        
        if len(rule) == 0:
            return np.sum(y == False) == 0
        
        covered = self._rule_covers(rule, X)

        return np.sum((y == False) & covered) == 0
    
    def _not_covered(self, rule, data):
        """
        Metoda usuwająca z danych przykłady pokryte przez regułę
        """
        if len(data) == 0:
            print("Dane są puste, nic do usunięcia.")
            return data
        
        X = data[:, :-1]
        covered = self._rule_covers(rule, X)
        
        return data[~covered]
    
    def _not_covered_by_literal(self, literal, data):
        """
        Metoda usuwająca z danych przykłady pokryte przez pojedynczy warunek (literal)
        """
        if len(data) == 0:
            print("Dane są puste, nic do usunięcia.")
            return data
        
        X = data[:, :-1]
        covered = self._literal_covers(literal, X)
        
        return data[covered]
    
    def _literal_covers(self, literal, X):
        """
        Metoda sprawdzająca, które przykłady są pokryte przez pojedynczy warunek (literal)
        """
        feature_idx = literal['feature']
        feature_values = X[:, feature_idx]
        
        if literal['operator'] == '<':
            return feature_values < literal['value']
        else:  # dla operatora >
            return feature_values > literal['value']
    
    def _rule_covers(self, rule, X):
        """
        Metoda sprawdzająca, które przykłady są pokryte przez regułę (koniunkcję warunków)
        """
        if len(rule) == 0:
            return np.zeros(len(X), dtype=bool)
        
        covered = np.ones(len(X), dtype=bool)
        
        for literal in rule:
            covered &= self._literal_covers(literal, X)
        
        return covered
    
    def predict(self, X):
        """
        Metoda przewidująca etykietę dla danych wejściowych
        """
        if isinstance(X, pd.DataFrame):
            X = X.values
        
        X = np.array(X, dtype=float)
        predictions = np.zeros(len(X), dtype=bool)
        
        for rule in self.rules:
            covered = self._rule_covers(rule, X)
            predictions |= covered
        
        return predictions
    
    def print_rules(self):
        """
        Metoda wyświetlająca nauczone reguły w czytelnej formie
        """
        if len(self.rules) == 0:
            print("Brak nauczonych reguł.")
            return
        
        print(f"Nauczono {len(self.rules)} reguły:\n")
        
        for i, rule in enumerate(self.rules):
            print(f"Reguła {i+1}:")
            if len(rule) == 0:
                print("  (pusta reguła)")
            else:
                conditions = []
                for literal in rule:
                    feature_name = self.feature_names[literal['feature']]
                    
                    cond = f"{feature_name} {literal['operator']} {literal['value']:.4f}"
                    
                    conditions.append(cond)
                
                print(f"  IF {' AND '.join(conditions)}")
                print(f"  THEN Diagnoza = True (Malignant)")
            print()