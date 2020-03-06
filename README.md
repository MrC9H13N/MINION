Echecs

https://socket.io/

Envoi client:
id : playerConnect / parameter : playerId
id : playerConnect / parameter : playerId
(si 2 playerConnect différents) ->  id : start / parameter : timestamp
                                    id : move / parameter : case (28, 63, ...)

Envoi serveur:
(a chaque move) ->  id : tableau / parameter : tableau
                    id : echec / parameter : OSEF
                    id echecEtMat / parameter OSEF
