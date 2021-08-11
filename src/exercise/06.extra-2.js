// useEffect: HTTP requests
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
// 🐨 you'll want the following additional things from '../pokemon':
// fetchPokemon: the function we call to get the pokemon info
// PokemonInfoFallback: the thing we show while we're loading the pokemon info
// PokemonDataView: the stuff we use to display the pokemon info
import {
  fetchPokemon, 
  PokemonInfoFallback, 
  PokemonDataView,
  PokemonForm
} from '../pokemon'

function PokemonInfo({pokemonName}) {
  // 🐨 Have state for the pokemon (null)
  const [pokemon, setPokemon] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [status, setStatus] = React.useState('idle')
  // 🐨 use React.useEffect where the callback should be called whenever the
  // pokemon name changes.
  React.useEffect(() => {
    setError(null)
    // 💰 if the pokemonName is falsy (an empty string) then don't bother making the request (exit early).
    if (pokemonName) {
      // 🐨 before calling `fetchPokemon`, clear the current pokemon state by setting it to null
      setPokemon(null)
      // 💰 Use the `fetchPokemon` function to fetch a pokemon by its name:
      setStatus('pending')
      fetchPokemon(pokemonName).then(
        pokemonData => {
          setPokemon({ ...pokemonData})
          setStatus('resolved')
        },
        error => {
          setError(error)
          setStatus('rejected')
        },
      )
    }
    // 💰 DON'T FORGET THE DEPENDENCIES ARRAY!
  }, [pokemonName])
  // 🐨 return the following things based on the `pokemon` state and `pokemonName` prop:
  //   1. no pokemonName: 'Submit a pokemon'
  if (status === 'rejected') {
    return (
      <div role="alert">
        There was an error: <pre style={{whiteSpace: 'normal'}}>{error.message}</pre>
      </div>
    )
  } else if (status === 'idle') {
    return 'Submit a pokemon'
  //   2. pokemonName but no pokemon: <PokemonInfoFallback name={pokemonName} />
  } else if (status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />
  } else if (status === 'resolved') {
    //   3. pokemon: <PokemonDataView pokemon={pokemon} />
    return <PokemonDataView pokemon={pokemon} />
  }
  throw new Error('This should be impossible')
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonInfo pokemonName={pokemonName} />
      </div>
    </div>
  )
}

export default App
