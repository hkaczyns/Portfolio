import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import time
from IReppp import IRepppClassifier, COLUMN_NAMES
from demonstration import train_test_split, calculate_accuracy
from wittgenstein import RIPPER, IREP

if __name__ == "__main__":

    # Wczytanie danych
    df = pd.read_csv('wdbc.csv', header=None, names=COLUMN_NAMES)
    X = df.drop(['ID', 'Diagnosis'], axis=1)
    y = (df['Diagnosis'] == 'M').values

    # Powtórzenia eksperymentu
    n_runs = 10

    print("=== Eksperyment 1: Wpływ rozmiaru zbioru treningowego ===")

    train_sizes = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
    exp1_results = {
        'IRep++': {'accuracy': [], 'std': []},
        'IREP': {'accuracy': [], 'std': []},
        'RIPPER': {'accuracy': [], 'std': []}
    }

    for train_size in train_sizes:
        print(f"Procent danych w zbiorze treningowym: {train_size}")
        test_size = 1 - train_size
        
        irep_acc = []
        irep_witt_acc = []
        ripper_acc = []
        
        for run in range(n_runs):
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size)
            
            # IRep++
            clf = IRepppClassifier(max_bad_rules=5)
            clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)
            irep_acc.append(calculate_accuracy(y_test, y_pred))
            
            # IREP
            train_df = pd.concat([X_train, pd.Series(y_train, name='Diagnosis')], axis=1)
            clf_irep = IREP()
            clf_irep.fit(train_df, class_feat='Diagnosis', pos_class=True)
            y_pred = np.array([pred == True for pred in clf_irep.predict(X_test.copy())])
            irep_witt_acc.append(calculate_accuracy(y_test, y_pred))
            
            # RIPPER
            clf_ripper = RIPPER()
            clf_ripper.fit(train_df, class_feat='Diagnosis', pos_class=True)
            y_pred = np.array([pred == True for pred in clf_ripper.predict(X_test.copy())])
            ripper_acc.append(calculate_accuracy(y_test, y_pred))
        
        exp1_results['IRep++']['accuracy'].append(np.mean(irep_acc))
        exp1_results['IRep++']['std'].append(np.std(irep_acc))
        exp1_results['IREP']['accuracy'].append(np.mean(irep_witt_acc))
        exp1_results['IREP']['std'].append(np.std(irep_witt_acc))
        exp1_results['RIPPER']['accuracy'].append(np.mean(ripper_acc))
        exp1_results['RIPPER']['std'].append(np.std(ripper_acc))

    print("\nEksperyment 2: Wpływ stosunku rozmiarów zbioru rosnącego i przycinającego")

    grow_ratios = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
    exp2_results = {
        'IRep++': {'accuracy': [], 'std': []},
        'IREP': {'accuracy': [], 'std': []},
        'RIPPER': {'accuracy': [], 'std': []}
    }

    for ratio in grow_ratios:
        print(f"Procent danych w zbiorze rosnącym: {ratio}")
        
        irep_acc = []
        irep_witt_acc = []
        ripper_acc = []
        
        for run in range(n_runs):
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
            
            # IRep++
            clf = IRepppClassifier(max_bad_rules=5, grow_ratio=ratio)
            clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)
            irep_acc.append(calculate_accuracy(y_test, y_pred))
            
            # IREP (parametr prune_size)
            train_df = pd.concat([X_train, pd.Series(y_train, name='Diagnosis')], axis=1)
            clf_irep = IREP(prune_size=1-ratio)
            clf_irep.fit(train_df, class_feat='Diagnosis', pos_class=True)
            y_pred = np.array([pred == True for pred in clf_irep.predict(X_test.copy())])
            irep_witt_acc.append(calculate_accuracy(y_test, y_pred))
            
            # RIPPER (parametr prune_size)
            clf_ripper = RIPPER(prune_size=1-ratio)
            clf_ripper.fit(train_df, class_feat='Diagnosis', pos_class=True)
            y_pred = np.array([pred == True for pred in clf_ripper.predict(X_test.copy())])
            ripper_acc.append(calculate_accuracy(y_test, y_pred))
        
        exp2_results['IRep++']['accuracy'].append(np.mean(irep_acc))
        exp2_results['IRep++']['std'].append(np.std(irep_acc))
        exp2_results['IREP']['accuracy'].append(np.mean(irep_witt_acc))
        exp2_results['IREP']['std'].append(np.std(irep_witt_acc))
        exp2_results['RIPPER']['accuracy'].append(np.mean(ripper_acc))
        exp2_results['RIPPER']['std'].append(np.std(ripper_acc))

    # Wizualizacja wyników
    fig, axes = plt.subplots(1, 2, figsize=(16, 6))

    # Wykres 1: Wpływ rozmiaru zbioru treningowego
    ax1 = axes[0]
    for alg in ['IRep++', 'IREP', 'RIPPER']:
        means = exp1_results[alg]['accuracy']
        stds = exp1_results[alg]['std']
        ax1.plot(train_sizes, means, marker='o', label=alg, linewidth=2)
        ax1.fill_between(train_sizes, 
                        np.array(means) - np.array(stds), 
                        np.array(means) + np.array(stds), 
                        alpha=0.2)

    ax1.set_xlabel('Procent danych w zbiorze treningowym', fontsize=12)
    ax1.set_ylabel('Dokładność (Accuracy)', fontsize=12)
    ax1.set_title('Wpływ rozmiaru zbioru treningowego na dokładność', fontsize=14)
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # Wykres 2: Wpływ stosunku grow/prune
    ax2 = axes[1]
    for alg in ['IRep++', 'IREP', 'RIPPER']:
        means = exp2_results[alg]['accuracy']
        stds = exp2_results[alg]['std']
        ax2.plot(grow_ratios, means, marker='o', label=alg, linewidth=2)
        ax2.fill_between(grow_ratios, 
                        np.array(means) - np.array(stds), 
                        np.array(means) + np.array(stds), 
                        alpha=0.2)

    ax2.set_xlabel('Procent danych w zbiorze rosnącym', fontsize=12)
    ax2.set_ylabel('Dokładność (Accuracy)', fontsize=12)
    ax2.set_title('Wpływ stosunku rozmiarów zbioru rosnącego i przycinającego', fontsize=14)
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig('./plots/study_results.png', dpi=300, bbox_inches='tight')

    # Podsumowanie wyników
    print("\nPodsumowanie Eksperymentu 1")
    for alg in ['IRep++', 'IREP', 'RIPPER']:
        print(f"\n{alg}:")
        for i, size in enumerate(train_sizes):
            print(f"  Train size {size}: {exp1_results[alg]['accuracy'][i]:.4f} ± {exp1_results[alg]['std'][i]:.4f}")

    print("\nPodsumowanie Eksperymentu 2")
    for alg in ['IRep++', 'IREP', 'RIPPER']:
        print(f"\n{alg}:")
        for i, ratio in enumerate(grow_ratios):
            print(f"  Grow ratio {ratio}: {exp2_results[alg]['accuracy'][i]:.4f} ± {exp2_results[alg]['std'][i]:.4f}")