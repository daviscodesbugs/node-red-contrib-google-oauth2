const STATUS = {
    FILL: {
        RED: 'red',
        GREEN: 'green',
        YELLOW: 'yellow',
        BLUE: 'blue',
        GREY: 'grey'
    },
    SHAPE: {
        RING: 'ring',
        DOT: 'dot'
    }
};

class StatusHelper {
    constructor(node) {
        this.clear = () => {
            node.status({});
        }
        this.error = (msg) => {
            node.status({
                fill: STATUS.FILL.RED,
                shape: STATUS.SHAPE.DOT,
                text: msg
            });
        }
        this.start = () => {
            node.status({
                fill: STATUS.FILL.BLUE,
                shape: STATUS.SHAPE.RING,
                text: 'running'
            });
        }
        this.finish = () => {
            node.status({
                fill: STATUS.FILL.BLUE,
                shape: STATUS.SHAPE.DOT,
                text: 'done'
            });
        }
        this.startFetch = () => {
            node.status({
                fill: STATUS.FILL.YELLOW,
                shape: STATUS.SHAPE.RING,
                text: 'fetching'
            });
        }
        this.startUpload = () => {
            node.status({
                fill: STATUS.FILL.BLUE,
                shape: STATUS.SHAPE.RING,
                text: 'uploading'
            });
        }
    }
}

module.exports = {
    StatusHelper: StatusHelper
}