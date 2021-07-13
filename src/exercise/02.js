// useEffect: persistent state
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'

function Greeting({initialName = ''}) {
  // 🐨 initialize the state to the value from localStorage
  // 💰 window.localStorage.getItem('name') || initialName

  // 🐨 Here's where you'll use `React.useEffect`.
  // The callback should set the `name` in localStorage.
  // 💰 window.localStorage.setItem('name', name)

  // CUSTOM HOOK
  const useLocalStorageState = (key, defaultValue = '') => {
    const [state, setState] = React.useState(
      () => window.localStorage.getItem(key) || defaultValue,
    )
    React.useEffect(() => {
      window.localStorage.setItem(key, state)
    }, [key, state])

    return [state, setState]
  }

  function handleChange(event) {
    setName(event.target.value)
  }
  const [name, setName] = useLocalStorageState('name', initialName)
  return (
    <div>
      <form>
        <label htmlFor="name">Name: </label>
        <input value={name} onChange={handleChange} id="name" />
      </form>
      {name ? <strong>Hello {name}</strong> : 'Please type your name'}
    </div>
  )
}

function App() {
  return <Greeting />
}

export default App
