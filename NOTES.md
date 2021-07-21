## Notes

### SETUP SCRIPT

Lo lanci con

```
node setup
```

che fa

- Validazione di sistema (dei vari linguaggi e versioni che ci servono)
- installa dependencies
- puoi inserire anche o meno la tua email

### SETTINGS DA WORKSPACE

Basta aggiungere dentro `.vscode` un file `settings.json`

### ESEGUIRE TEST

Basta lanciare i comandi

```shell
npm run test
npm test
npm t
```

### FILTRARE PER NOME TEST

Basta lanciare

```shell
npm run test
p
```

e poi mettero il testo da filtrare

# HOOKS

disponibili sono:

- `React.useState`
- `React.useEffect`
- `React.useContext`
- `React.useRef`
- `React.useReducer`

Ogni hook ha un'API univoca. Alcuni restituiscono un valore (come `React.useRef`
e `React.useContext`), altre una coppia di valori (come `React.useState` e
`React.useReducer`), ed altre non restituiscono nulla (come `React.useEffect`).

## useState

Lo State puoi vederlo come: dati che cambiano nel corso del tempo.

Quando invochiamo il `set^^^` di uno state, diciamo a React di ri-renderizzare
il nostro component. E quando lo facciamo stavolta quando invochiamo
`React.useState` il valore con cui inizializza sarà quello precedente con cui
abbiamo invocato il `setCount`. Ciò andrà avanti sinché il componente non verrà
smontato, o l'utente chiude l'app dal browser.

** NON SETTARE MAI IL VALORE INIZIALE DELLO STATE AD `undefined` **

## useEffect: persistent state

Ci permette di gestire i Side Effects, come le chiamate HTTP o da local storage

### setLocalStorage

```javascript
window.localStorage.setItem(key, value)
```

### getLocalStorage

```javascript
window.localStorage.getItem(key)
```

### remove item from local storage

```javascript
window.localStorage.removeItem(key)
```

per settare un valore default in assenza di un altro

```javascript
window.localStorage.getItem(key) || defaultValue
```

### 💯 lazy state initialization

La lettura iniziale da localStorage è onerosa oltre ad essere un collo di
bottiglia.

Per evitare queste perdite di performance `useState` permette di passare come
argomento una funzione e non solo un valore
`React.useState(() => someExpensiveComputation())`

in questo modo la funzione `someExpensiveComputation` verrà chiamata solo quando
serve realmente.

> Learn more about
> [lazy state initialization](https://kentcdodds.com/blog/use-state-lazy-initialization-and-function-updates)

### 💯 custom hook

La cosa più bella degli hook è che se trovi nel tuo codice un pezzo di codice
che pensi possa essere utile pure da altre parti la puoi mettere dentro una
funzione e condividerla fra component. Queste funzioni sono dette "custom
hooks".

Inoltre React fa una `shallow compairison`

praticamente sono funzioni che raggruppano uso degli altri hooks

per evitare i Warning basta che nomini il custom hook con `useName`.

```javascript
const useLocalStorageState = (
  key,
  defaultValue = '',
  {serialize = JSON.stringify, deserialize = JSON.parse} = {},
) => {
  const [state, setState] = React.useState(() => {
    const valueInLocalStorage = window.localStorage.getItem(key)
    if (valueInLocalStorage) {
      return deserialize(valueInLocalStorage)
    }
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue
  })
  const prevKeyRef = React.useRef(key)
  React.useEffect(() => {
    const prevKey = prevKeyRef.current
    if (prevKey !== key) {
      window.localStorage.removeItem(prevKey)
    }
    prevKeyRef.current = key
    window.localStorage.setItem(key, serialize(state))
  }, [key, serialize, state])

  return [state, setState]
}
```

### 💯 rendere flessibile il localStorage hook

cerchiamo di spostare la logica complicata all'interno dell'hook di modo che dal
di fuori sia di semplice utilizzo

es: se volessimo rendere astratta la key e il value da salvare in local storage
e quindi poterlo serializzare e deserializzare usando `JSON.stringify` e
`JSON.parse`

passiamo questo serialize e deserialize che possono essere astratti come options

```javascript
const useLocalStorageState = (
    key,
    defaultValue = '',
    {serialize = JSON.stringify, deserialize = JSON.parse} = {},
  ) => {
```

in tal caso dato che userai il `serialize` dentro allo `useEffect` devi metterlo
anche come dependency

```javascript
React.useEffect(() => {
  const prevKey = prevKeyRef.current
  if (prevKey !== key) {
    window.localStorage.removeItem(prevKey)
  }
  prevKeyRef.current = key
  window.localStorage.setItem(key, serialize(state))
}, [key, serialize, state])
```

inoltre se il defaultValue che passi al custom hook è pesante dal punto di vista
computazionale e delle performance invece di passarlo come valore potresti
passarlo come `funzione`

```javascript
return typeof defaultValue === 'function' ? defaultValue() : defaultValue
```

infine potremmo voler cambiare la key dove salviamo nel localStorage e quindi
dovremmo rimuovere la vecchia key e il suo value da localStorage lo facciamo
usando i `ref`, in sto modo posso cambiarlo senza triggerare il rerendering

```javascript
const prevKeyRef = React.useRef(key)
React.useEffect(() => {
  const prevKey = prevKeyRef.current
  if (prevKey !== key) {
    window.localStorage.removeItem(prevKey)
  }
  prevKeyRef.current = key
```

in sto modo il nostro custom hook è super flessibile senza modificare il modo in
cui viene usato.

## Approfondimenti

Se vuoi saperne di più sul flusso degli hooks e l'ordine in cui vengono
chiamati, apri
[`src/examples/hook-flow.png`](https://github.com/simotae14/react-hooks/blob/main/src/examples/hook-flow.png)
ed
[`src/examples/hook-flow.js`](https://github.com/simotae14/react-hooks/blob/main/src/examples/hook-flow.js)

per intenderci `Run LayoutEffects` è come dire l'esecuzione degli `useEffect`,
una volta che React ha aggiornato il DOM lo comunica al browser per fargli fare
il `paint` dello schermo (es: se aggiungi con React un className questo è il
momento in cui viene applicato al Dom). Il `Cleanup Effects` invece indica che
React andrà a ripulire qualsiasi side Effect capitato dall'ultimo rendering. ed
infine farà il `Run Effects` di quegli effetti che deve applicare in questo
rendering.

vedremo che dopo lo start del component verrà triggerato il `lazy initializer`
dello state inoltre vediamo che gli `useEffect` vengono lanciati solo una volta
<b>terminato il rendering</b> quindi una volta che è avvenuto il return del
render. Gli `useEffect` infine vengono triggerati partendo da quello senza
dependencies, per poi passare a quello che un array vuoto come dependencies ed
infine a quello con dependencies dentro l'array

nel caso in cui invece triggeriamo anche il rendering del Child component, non
avremo + il lazy initializer dello useState poichè lo abbiamo già triggerato in
precedenza. Ma prima ancora di triggerare lo start, useState e render end e
useEffect del Child triggererà il render end del padre dato che quando viene
renderizzato il figlio è solo un `React.createElement` non una chiamata della
serie `Child`, il componente in sè verrà chiamato solo una volta che si procede
al paint nel browser.

Solo una volta renderizzato il Child verranno triggerati gli useEffect del
Parent (prima i `cleanup`)

se poi aggiorni il Child solo esso e i suoi useEffect verrano ritriggerati
(compreso di cleanup)

l'unmount infine viene triggerato solo quando togliamo il Child. Quindi farà il
cleanup di ogni useEffect e anche nel parent faremo il cleanup dello useEffect
senza dependencies e quello che ha come dependency lo showChild

# Lifting state

Praticamente quando dobbiamo condividere lo `state` fra `siblings` e quindi
dobbiamo trovare il
["lift the state"](https://reactjs.org/docs/lifting-state-up.html) ovvero il
parent più prossimo condiviso fra i sibling per poi fare il `props drilling`.
