import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import time
from IReppp import IRepppClassifier, COLUMN_NAMES
from demonstration import train_test_split, calculate_accuracy, calculate_precision, calculate_recall
from wittgenstein import RIPPER, IREP

if __name__ == "__main__":

    # Wczytanie danych
    df = pd.read_csv('wdbc.csv', header=None, names=COLUMN_NAMES)
    X = df.drop(['ID', 'Diagnosis'], axis=1)
    y = (df['Diagnosis'] == 'M').values

    # Powtórzenia eksperymentu
    n_runs = 10

    # Wyniki
    results = {
        'IRep++': {'accuracy': [], 'precision': [], 'recall': [], 'time': []},
        'IREP': {'accuracy': [], 'precision': [], 'recall': [], 'time': []},
        'RIPPER': {'accuracy': [], 'precision': [], 'recall': [], 'time': []}
    }

    # Eksperymenty
    for run in range(n_runs):
        print(f"Uruchomienie {run + 1}/{n_runs}")
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
        
        # IRep++
        start = time.time()
        clf = IRepppClassifier(max_bad_rules=5)
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        elapsed = time.time() - start
        
        acc, prec, rec = calculate_accuracy(y_test, y_pred), calculate_precision(y_test, y_pred), calculate_recall(y_test, y_pred)
        results['IRep++']['accuracy'].append(acc)
        results['IRep++']['precision'].append(prec)
        results['IRep++']['recall'].append(rec)
        results['IRep++']['time'].append(elapsed)
        
        # IREP z wittgenstein
        train_df = pd.concat([X_train, pd.Series(y_train, name='Diagnosis')], axis=1)
        test_df = X_test.copy()
        
        start = time.time()
        clf_irep = IREP()
        clf_irep.fit(train_df, class_feat='Diagnosis', pos_class=True)
        y_pred_raw = clf_irep.predict(test_df)
        elapsed = time.time() - start
        
        # Konwersja wyników do boolean
        y_pred = np.array([pred == True for pred in y_pred_raw])
        
        acc, prec, rec = calculate_accuracy(y_test, y_pred), calculate_precision(y_test, y_pred), calculate_recall(y_test, y_pred)
        results['IREP']['accuracy'].append(acc)
        results['IREP']['precision'].append(prec)
        results['IREP']['recall'].append(rec)
        results['IREP']['time'].append(elapsed)
        
        # RIPPER z wittgenstein
        start = time.time()
        clf_ripper = RIPPER()
        clf_ripper.fit(train_df, class_feat='Diagnosis', pos_class=True)
        y_pred_raw = clf_ripper.predict(test_df)
        elapsed = time.time() - start
        
        # Konwersja wyników do boolean
        y_pred = np.array([pred == True for pred in y_pred_raw])
        
        acc, prec, rec = calculate_accuracy(y_test, y_pred), calculate_precision(y_test, y_pred), calculate_recall(y_test, y_pred)
        
        results['RIPPER']['accuracy'].append(acc)
        results['RIPPER']['precision'].append(prec)
        results['RIPPER']['recall'].append(rec)
        results['RIPPER']['time'].append(elapsed)

    # Wizualizacja
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    metrics = ['accuracy', 'precision', 'recall', 'time']
    titles = ['Accuracy (Dokładność)', 'Precision (Precyzja)', 'Recall (Czułość)', 'Czas wykonania (s)']

    for idx, (metric, title) in enumerate(zip(metrics, titles)):
        ax = axes[idx // 2, idx % 2]
        
        algorithms = ['IRep++', 'IREP', 'RIPPER']
        means = [np.mean(results[alg][metric]) for alg in algorithms]
        stds = [np.std(results[alg][metric]) for alg in algorithms]
        
        x = np.arange(len(algorithms))
        bars = ax.bar(x, means, yerr=stds, capsize=5, alpha=0.7)
        
        ax.set_ylabel(title)
        ax.set_xticks(x)
        ax.set_xticklabels(algorithms)
        ax.set_title(f'{title} - średnia z {n_runs} uruchomień')
        ax.grid(axis='y', alpha=0.3)
        
        for i, (mean, std) in enumerate(zip(means, stds)):
            ax.text(i, mean + std + 0.01, f'{mean:.3f}', ha='center', va='bottom')

    plt.tight_layout()
    plt.savefig('./plots/comparison_results.png', dpi=300, bbox_inches='tight')

    print("\nPodsumowanie wyników:")
    for alg in ['IRep++', 'IREP', 'RIPPER']:
        print(f"\n{alg}:")
        for metric in metrics:
            mean = np.mean(results[alg][metric])
            std = np.std(results[alg][metric])
            print(f"  {metric}: {mean:.4f} ± {std:.4f}")