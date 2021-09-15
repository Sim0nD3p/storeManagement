class containerObject{
    constructor(name, position, dimensions, heightNb, container, consomMensMoy, accessPoint){
        this.name = name;
        this.height = heightNb
        this.accessPoint = accessPoint;
        this.totalHeight = container ? container.height * heightNb : undefined;
        this.weight = container ? container.weight * heightNb : undefined;
        this.consommation = consomMensMoy;
        this.position = {
            front: position.front,
            width: position.width,
        }
        this.dimensions = {
            front: dimensions.front,
            width: dimensions.width,
        }
        this.getPos;
        this.getDim;
    }
    test = () => {
        console.log('container method accessible')
    }

    getPosCoord = (ratioL, ratioW) => {
        this.getPos = {
            front: Math.ceil(this.position.front / ratioL),
            width: Math.ceil(this.position.width / ratioW),
        }
        this.getDim = {
            front: Math.ceil(this.dimensions.front / ratioL),
            width: Math.ceil(this.dimensions.width / ratioW)
        }
        return {
            position:{
                front: Math.floor(this.position.front / ratioL),
                width: Math.floor(this.position.width / ratioW),
            },
            dimensions: {
                front: Math.floor(this.dimensions.front / ratioL),
                width: Math.floor(this.dimensions.width / ratioW)
            }
        }
    }

}

module.exports = containerObject;