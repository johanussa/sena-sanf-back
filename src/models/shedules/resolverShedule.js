const SheduleModel = require("./modelShedule");
const boom = require("@hapi/boom");

const resolverShedule = {
  Query: {
    allShedules: async () => {
      const shedules = await SheduleModel.find();
      if (shedules.length) return shedules;
      throw boom.notFound('Shedules Not Found in DB');
    },
    getSheduleClassRoom: async (parent, args) => {
      const shedules = await SheduleModel.find();
      const sheduleClass = [];
      shedules.forEach(e => {
        e.Horario.forEach(elm => {
          if (elm.FechaInicio === args.FechaInicio) {
            elm.Horas.forEach(({ Ambiente, pos }) => {
              if (Ambiente === args.Ambiente) sheduleClass.push(pos);
            });
          }
        });
      });
      return sheduleClass;
    },
    getOneShedule: async (parent, args) => {
      const query = { Instructor: args.Instructor };
      const shedule = await SheduleModel.findOne(query).populate('Instructor');
      if (shedule) return shedule;
      throw boom.notFound(`El Instructor ${args.Instructor} No Tiene horarios Asignados`);
    }
  },
  Mutation : {
    addShedule: async (parent, args) => {
      try {
        const sheduleCreate = await SheduleModel.create(args);
        return sheduleCreate;
      } catch(error) {
        throw boom.notFound(`No se pudo crear el Horario, Error: ${error}`);
      }
    },
    updateShedule: async (parent, args) => {
      const query = { _id: args._id };
      const sheduleUp = await SheduleModel.findByIdAndUpdate(query, args, { new: true });
      if (sheduleUp) return sheduleUp;
      throw boom.notFound(`El ID ${args._id} No Existe`);
    }
  }
}

module.exports = resolverShedule;