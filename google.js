module.exports = function(RED) {
    "use strict";

    const { google } = require('googleapis');
    const discovery = google.discovery({ version: 'v1' });

    const { StatusHelper } = require('./status');

    function GoogleNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const status = new StatusHelper(node);
        const drive = RED.nodes.getCredentials(config.google).drive;

        node.on('input', async function(msg, send, done) {
            status.clear();

            try {
                let operation = msg.operation || config.operation || undefined;
                let params = msg.payload;

                const method = operation.split('.')
                    .reduce((acc, curr) => acc[curr] , drive)
                    .bind(drive);

                status.start();
                const res = await method(params);
                status.finish();

                node.send(res.data);
            } catch(err) {
                node.error(err);
                status.error(err);
            }

            if (done) done();
        });
    }

    RED.nodes.registerType('google-drive', GoogleNode);

    RED.httpAdmin.get('/google/apis/drive/info', function(req, res) {
        discovery.apis.getRest({
            api: "drive",
            version: "v3",
            fields: "auth,methods,resources"
        }, function(err, data) {
            if (err) return res.status(500).json(err);

            let operations = [];
            function processResources(d, parent) {
                var prefix = parent ? parent + '.' : '';
                if (d.methods) {
                    Object.keys(d.methods).forEach(function(k) {
                        operations.push(prefix + k);
                    });
                }
                if (d.resources) {
                    Object.keys(d.resources).forEach(function(k) {
                        processResources(d.resources[k], prefix + k);
                    });
                }
            }
            processResources(data.data);

            operations.sort();
            res.json({
                operations: operations
            });
        });
    });

};
