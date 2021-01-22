module.exports = function(RED) {
    "use strict";

    const { google } = require('googleapis');

    function GoogleNode(n) {
        RED.nodes.createNode(this, n);
    }

    RED.nodes.registerType(
        "google-credentials",
        GoogleNode,
        {
            credentials: {
                client_id: { type:"text" },
                client_secret: { type:"password" },
                access_token: { type: "password" },
                refresh_token: { type: "password" },
                drive: { type: "password" }
            }
        }
    );

    RED.httpAdmin.get(
        '/google-credentials/auth',
        function(req, resp) {

            if (
                !req.query.id ||
                !req.query.clientID ||
                !req.query.clientSecret
            ) {
                resp.sendStatus(400);
                return;
            }

            const oauth2Client = new google.auth.OAuth2(
                req.query.clientID,
                req.query.clientSecret,
                req.headers.referer + 'google-credentials/auth/callback'
            );

            RED.nodes.addCredentials(req.query.id, {
                oauth2_client: oauth2Client
            });

            // TODO CSRF

            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: [ 'https://www.googleapis.com/auth/drive' ],
                state: req.query.id
            });

            resp.redirect(authUrl);
    });

    RED.httpAdmin.get(
        '/google-credentials/auth/callback',
        function(req, resp) {

            if (req.query.error) {
                return resp.send(
                    "google.error.error", {
                        error: req.query.error,
                        description: req.query.error_description
                    }
                );
            }

            const nodeID = req.query.state;
            const creds = RED.nodes.getCredentials(nodeID);
            const oauth2Client = creds.oauth2_client;

            oauth2Client.getToken(req.query.code)
                .then((res) => {
                    oauth2Client.setCredentials(res.tokens);
                    let drive = google.drive({
                        version: 'v3',
                        auth: oauth2Client
                    });

                    RED.nodes.addCredentials(nodeID, {
                        drive: drive
                    });

                    resp.send('<div>Authorized</div><script>close()</script>');
                })
                .catch(err => {
                    return resp.send('Could not receive tokens\n' + err);
                });

    });

};