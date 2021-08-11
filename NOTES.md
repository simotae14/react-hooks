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

### 💯 colocating state

A volte bisogna rimettere lo state semplicemente non più condiviso all'interno
del component che lo usa e rimuoverlo dal lifting state. Sto procedimento di
rimettere lo state al suo posto è detto
[colocate state](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)

come creare un array di null

```javascript
Array(9).fill(null)
```

- **Managed State:** State che definisci esplicitamente e che gestisci
- **Derived State:** State che ti calcoli in base a dell'altro state

📜 Per saperne di più sul **Derived State:**
[Don't Sync State. Derive It!](https://kentcdodds.com/blog/dont-sync-state-derive-it)

# Interagire col DOM, useRef e useEffect

Gli elementi del DOM vengono creati solo col `ReactDOM.render`
Col `ref` quindi possiamo chiedere a React di avere accesso ad un nodo del DOM prima che venga renderizzato

ES:
```javascript
function MyDiv() {
  const myDivRef = React.useRef()
  React.useEffect(() => {
    const myDiv = myDivRef.current
    // myDiv is the div DOM node!
    console.log(myDiv)
  }, [])
  return <div ref={myDivRef}>hi</div>
}
```

Una volta che viene lanciato il `render` il Component è detto <b>montato</b>, ed in quel momento viene triggerato lo `useEffect` e quindi il `ref` prende il suo valore `current`
Se accedi al current senza useEffect otterrai undefined

Se smonti poi il Component conviene rimuovere gli event handler sui nodi referenziati
es:
```javascript
  React.useEffect(() => {
    const tiltNode = tiltRef.current
    VanillaTilt.init(tiltNode, {
      max: 25,
      speed: 400,
      glare: true,
      'max-glare': 0.5,
    })
    return () => tiltNode.vanillaTilt.destroy()
  }, [])
```
ritorna il cleanup dell'evento, perchè non esiste un Garbage Collector degli eventi e quindi sarebbe sempre referenziata
è lo stesso che faremmo col `componentWillUnmount` in un Class Component
```javascript
componentWillUnmount() {
  this.tiltRef.current.vanillaTilt.destroy()
}
```

# useEffect: HTTP requests

le Richieste HTTP sono uno dei <b>Side Effects</b> quindi vanno gestite con `useEffect`

Una cosa importante da ricordare sull'hook `useEffect` è che non puoi restituire nulla se non una funzione di cleanup. Questa regola ha implicazioni riguardo alla sintassi dell'async/await
```javascript
// this does not work, don't do this:
React.useEffect(async () => {
  const result = await doSomeAsyncThing()
  // do something with the result
})
Questo difatti non funzionerebbe perchè una funzione async in automatico restituisce una Promise (anche se non fai il return esplicito di nulla), è dovuta alla Sintassi di `async/await`. Un modo per aggirarlo è definire dentro allo useEffect una funzione async che poi invoco sempre dentro lo useEffect

```javascript
React.useEffect(() => {
  async function effect() {
    const result = await doSomeAsyncThing()
    // do something with the result
  }
  effect()
})
```
in sto modo non restituisci nulla nello useEffect se non al massimo la funzione di cleanup

Un altro modo è creare una funzione esterna che racchiuda tutto il codice async e chiamarla usando il `.then` dentro lo useEffect invece di usare la sintassi `async/await`

```javascript
React.useEffect(() => {
  doSomeAsyncThing().then(result => {
    // do something with the result
  })
})
```

### 💯 handle errors in a Fetch
Per gestire gli errori di una Promise lo possiamo fare in 2 modi
1. col `catch`
```javascript
// option 1: using .catch
fetchPokemon(pokemonName)
  .then(pokemon => setPokemon(pokemon))
  .catch(error => setError(error))
```
che però prende gli errori sia della `fetch` che dei `setState` all'interno della chiamata

2. passando un secondo argomento al `.then`
```javascript
// option 2: using the second argument to .then
fetchPokemon(pokemonName).then(
  pokemon => setPokemon(pokemon),
  error => setError(error),
)
```
in questo caso intercetta SOLO l'errore della Fetch

### 💯 use a status
A volte quando hai a che fare con diversi return da dare in base al valore raggiunto da una fetch conviene usare uno `status` per rappresentare i vari casi in maniera + semplice



ErrorBoundary è un Class Component e forse uno dei pochi Component che dovrai tenere sotto forma di Classe

