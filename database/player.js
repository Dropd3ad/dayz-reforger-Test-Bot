const { weapons } = require('./weapons');

// Creates a copy of an object to prevent mutation of parent (i.e BodyParts, createWeaponsObject)
const copy = (obj) => JSON.parse(JSON.stringify(obj));

const BodyParts = {
  Head:     0,
  Torso:    0,
  RightArm: 0,
  LeftArm:  0,
  RightLeg: 0,
  LeftLeg:  0,
};

const createWeaponsObject = (value) => {
  const defaultWeapons = {};
  for (const [_, weaponNames] of Object.entries(weapons)) {
    for (const [name, _] of Object.entries(weaponNames)) {
      defaultWeapons[name] = value;
    }
  }
  return copy(defaultWeapons);
};

module.exports = {
  UpdatePlayer: async (client, player, interaction=null) => {
    /* Wrapping this function in a promise solves some bugs */
    return new Promise(resolve => {
      client.dbo.collection("players").updateOne(
        { "playerID": player.playerID },
        { $set: {...player} },
        { upsert: true }, // Create player stat document if it does not exist
        (err, _) => {
          if (err) {
            if (interaction == null) return client.error(`UpdatePlayer Error: ${err}`);
            else return client.sendInternalError(interaction, `UpdatePlayer Error: ${err}`);
          } else resolve();
        }
      );
    });
  },

  getDefaultPlayer(gamertag, playerId, nitradoServerId) {
    return {
      // Identifiers
      gamertag:               gamertag,
      playerID:               playerId,
      discordID:              "",
      nitradoServerID:        nitradoServerId,

      // General PVP Stats
      KDR:                    0.00,
      kills:                  0,
      deaths:                 0,
      killStreak:             0,
      bestKillStreak:         0,
      longestKill:            0,
      deathStreak:            0,
      worstDeathStreak:       0,
      
      // In depth PVP Stats
      shotsLanded:            0,
      timesShot:              0,
      shotsLandedPerBodyPart: copy(BodyParts),
      timesShotPerBodyPart:   copy(BodyParts),
      weaponStats:            createWeaponsObject({
        kills: 0,
        deaths: 0,
        shotsLanded: 0,
        timesShot:   0,
        shotsLandedPerBodyPart: copy(BodyParts),
        timesShotPerBodyPart:   copy(BodyParts),
      }),
      combatRating:           800,
      highestCombatRating:    800,
      lowestCombatRating:     800,
      combatRatingHistory:    [800],
      
      // General Session Data
      lastConnectionDate:     null,
      lastDisconnectionDate:  null,
      lastDamageDate:         null,
      lastDeathDate:          null,
      lastHitBy:              null,
      connected:              false,
      pos:                    [],
      lastPos:                [],
      time:                   null,
      lastTime:               null,
      
      // Session Stats
      totalSessionTime:       0,
      lastSessionTime:        0,
      longestSessionTime:     0,
      connections:            0,
 
      // Other
      bounties:               [],
      bountiesLength:         0,
    }
  },

  insertPVPstats(player) {
    player.shotsLanded = 0;
    player.timesShot = 0;
    player.shotsLandedPerBodyPart = copy(BodyParts);
    player.timesShotPerBodyPart = copy(BodyParts);
    player.weaponStats = createWeaponsObject({
      kills: 0,
      deaths: 0,
      shotsLanded: 0,
      timesShot:   0,
      shotsLandedPerBodyPart: copy(BodyParts),
      timesShotPerBodyPart:   copy(BodyParts),
    });
    return player;
  },

  // If a new weapon is not in the existing weaponStats, this will add it.
  createWeaponStats(player, weapon) {
    player.weaponStats[weapon] = {
      kills: 0,
      deaths: 0,
      shotsLanded: 0,
      timesShot:   0,
      shotsLandedPerBodyPart: copy(BodyParts),
      timesShotPerBodyPart:   copy(BodyParts),
    }
    return player;
  }
}
