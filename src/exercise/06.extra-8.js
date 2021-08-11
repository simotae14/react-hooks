// useEffect: HTTP requests
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
// 🐨 you'll want the following additional things from '../pokemon':
// fetchPokemon: the function we call to get the pokemon info
// PokemonInfoFallback: the thing we show while we're loading the pokemon info
// PokemonDataView: the stuff we use to display the pokemon info
import {ErrorBoundary} from 'react-error-boundary'
import {
  fetchPokemon, 
  PokemonInfoFallback, 
  PokemonDataView,
  PokemonForm
} from '../pokemon'

function ErrorFallback({error, resetErrorBoundary}) {
  return (
    <div role="alert">
      There was an error: <pre style={{whiteSpace: 'normal'}}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function PokemonInfo({pokemonName}) {
  // 🐨 Have state for the pokemon (null)
  const [state, setState] = React.useState({
    status: pokemonName ? 'pending' : 'idle',
    pokemon: null,
    error: null
  })
  // 🐨 use React.useEffect where the callback should be called whenever the
  // pokemon name changes.
  React.useEffect(() => {
    setState({...state, error: null})
    // 💰 if the pokemonName is falsy (an empty string) then don't bother making the request (exit early).
    if (pokemonName) {
      // 🐨 before calling `fetchPokemon`, clear the current pokemon state by setting it to null
      setState({status: 'pending', pokemon: null})
      // 💰 Use the `fetchPokemon` function to fetch a pokemon by its name:
      fetchPokemon(pokemonName).then(
        pokemonData => {
          setState({
            status: 'resolved',
            pokemon: pokemonData,
            error: null
          })
        },
        error => {
          setState({
            status: 'rejected',
            pokemon: null,
            error
          })
        },
      )
    }
    // 💰 DON'T FORGET THE DEPENDENCIES ARRAY!
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemonName])
  // 🐨 return the following things based on the `pokemon` state and `pokemonName` prop:
  //   1. no pokemonName: 'Submit a pokemon'
  if (state.status === 'rejected') {
    throw state.error
  } else if (state.status === 'idle') {
    return 'Submit a pokemon'
  //   2. pokemonName but no pokemon: <PokemonInfoFallback name={pokemonName} />
  } else if (state.status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />
  } else if (state.status === 'resolved') {
    //   3. pokemon: <PokemonDataView pokemon={pokemon} />
    return <PokemonDataView pokemon={state.pokemon} />
  }
  throw new Error('This should be impossible')
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <ErrorBoundary resetKeys={[pokemonName]} onReset={handleReset} FallbackComponent={ErrorFallback}>
          <PokemonInfo pokemonName={pokemonName} />
        </ErrorBoundary>      
      </div>
    </div>
  )
}

export default App
