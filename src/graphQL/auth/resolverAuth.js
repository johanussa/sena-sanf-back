const UserModel = require('../../models/users/modelUser');
const { generateToken } = require('../../utils/tokenUtils');
const boom = require('@hapi/boom');
const bcrypt = require('bcryptjs');

const resolverAuth = {
  Mutation: {
    registerUser: async (root, args) => {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(args.Password, salt);
        args.Password = hashedPassword;
        const userRegister = await UserModel.create(args);
        return {
          token: generateToken({
            _id: userRegister._id,
            Nombre: userRegister.Nombre,
            Apellido: userRegister.Apellido,
            Num_Documento: userRegister.Num_Documento,
            Email: userRegister.Email,
            Rol: userRegister.Rol,
            Active: userRegister.Active
          })
        };
      } catch (error) { throw boom.conflict(`No se pudo crear el usuario, Error: ${error}`); }
    },
    loginUser: async (root, args) => {
      const findUser = await UserModel.findOne({ Num_Documento: args.Num_Documento });
      if (findUser) {
        if (!findUser.Active)
          throw boom.conflict('Lo sentimos, su Usuario se encuentra Inactivo, por favor comuniquese con el Administrador');
        const { Num_Documento, Tipo_Documento, Password } = findUser;
        if (Tipo_Documento === args.Tipo_Documento && Num_Documento === args.Num_Documento) {
          const valid = await bcrypt.compare(args.Password, Password);
          if (!valid) throw boom.notFound('Lo sentimos, los Datos ingresados No son validos, Verifiquelos');
          return { 
            token: generateToken({
              _id: findUser._id,
              Nombre: findUser.Nombre,
              Apellido: findUser.Apellido,
              Num_Documento: findUser.Num_Documento,
              Email: findUser.Email,
              Rol: findUser.Rol,
              Active: findUser.Active
            })
          }
        }
      } else {
        throw boom.conflict(`Lo sentimos, los Datos ingresados No son validos, Verifiquelos, o Registrese`);
      }
    },
    refreshToken: async (root, args, context) => {
      if (!context.currentUser) return { error: 'Token No Valido'};
      return { 
        token: generateToken({
          _id: context.currentUser._id,
          Nombre: context.currentUser.Nombre,
          Apellido: context.currentUser.Apellido,
          Num_Documento: context.currentUser.Num_Documento,
          Email: context.currentUser.Email,
          Rol: context.currentUser.Rol,
          Active: context.currentUser.Active
        })
      };
    }
  }
}

module.exports = resolverAuth;