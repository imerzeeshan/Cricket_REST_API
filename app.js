const path = require('path')
const {open} = require('sqlite')
const express = require('express')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')

const port = 3000

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(port, () => {
      console.log(`Server Running at port ${port}.`)
    })
  } catch (e) {
    console.log('DB Error : ', e.message)
    process.exit(1)
  }
}
initializeDBAndServer()

//Get players API
app.get('/players/', async (request, response) => {
  const getAllPlayersDetailsQuery = `
    SELECT 
      * 
    FROM 
      cricket_team;
  `
  const allPlayers = await db.all(getAllPlayersDetailsQuery)
  const ans = allPlayers => {
    return {
      playerId: allPlayers.player_id,
      playerName: allPlayers.player_name,
      jerseyNumber: allPlayers.jersey_number,
      role: allPlayers.role,
    }
  }
  response.send(allPlayers.map(eachPlayer => ans(eachPlayer)))
})

//Add player API
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `
  INSERT INTO 
    cricket_team(player_Name,jersey_Number,role)
  VALUES(
    '${playerName}',
    ${jerseyNumber},
    '${role}'
  );
  `
  const dbResponse = await db.run(addPlayerQuery)
  // console.log(dbResponse)
  // response.send({lastID: dbResponse.lastID})
  response.send('Player Added to Team')
})

//get a player API
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
  select 
    * 
  from 
    cricket_team 
  where
     player_id = ${playerId};`
  const playerDetailsArray = await db.all(getPlayerQuery)

  const ans = playerD => {
    return {
      playerId: playerD.player_id,
      playerName: playerD.player_name,
      jerseyNumber: playerD.jersey_number,
      role: playerD.role,
    }
  }

  const finaleDetail = playerDetailsArray.map(eachPlayer => ans(eachPlayer))
  response.send(finaleDetail[0]);
})

//Update player details API
app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params

  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const updatePlayerQuery = `
    UPDATE
      cricket_team 
    SET 
      player_name='${playerName}', 
      jersey_number=${jerseyNumber},
      role='${role}'
    where 
      player_id = ${playerId};
  `
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//Delete Player API
app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
