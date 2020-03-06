Echecs

- Flash<br>
- Breaking bad<br>
- Casa de papel<br>

https://socket.io/

Envoi client:<br>
id : playerConnect / parameter : playerId<br>
id : playerConnect / parameter : playerId<br>
(si 2 playerConnect différents) ->  id : start / parameter : timestamp<br>
                                    id : move / parameter : case (28, 63, ...)<br>

Envoi serveur:<br>
(a chaque move) ->  id : tableau / parameter : tableau<br>
                    id : echec / parameter : OSEF<br>
                    id echecEtMat / parameter OSEF<br>
