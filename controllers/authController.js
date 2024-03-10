const User = require("../models/User.js");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator"); //usamos esto para validar lo que hemos programado en userRoutes con check
const jwt = require("jsonwebtoken");
const restorePasswordEmail = require("../helpers/restorePasswordEmail.js");
const hashPassword = require("../helpers/hashPassword.js");

exports.autenticarUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Extraer correo electrónico y contraseña del cuerpo de la solicitud
  const { email, password } = req.body;

  try {
    // Revisar que sea un usuario registrado
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({ error: "El usuario no existe" });
    }

    // Revisar si la contraseña proporcionada es la contraseña de superusuario
    // Asumiendo que la contraseña de superusuario se almacena en una variable de entorno llamada SUPERUSER_PASSWORD
    const isSuperUser = password === process.env.SUPERUSUARIO_PASS;

    // En caso de que exista el usuario, revisamos la contraseña (a menos que sea el superusuario)
    let correctPassword = false;
    if (!isSuperUser) {
      correctPassword = await bcryptjs.compare(password, user.password);
    }

    if (!correctPassword && !isSuperUser) {
      return res.status(401).send({ error: "Password Incorrecto" });
    }

    // Si todo es correcto (correo electrónico y contraseña o es superusuario), generamos el JWT
    const payload = {
      user: {
        id: user.id,
        nombre: user.nombre,
        // Agregamos una bandera para identificar si es un superusuario
        isSuperUser: isSuperUser,
      },
    };

    let token = jwt.sign(payload, process.env.SECRETA, {
      expiresIn: 43200, // 12 horas convertido a segundos
    });

    res.status(200).send({
      accessToken: token,
      errors: "Usuario Loggeado Correctamente",
      nombre: user.nombre,
      id: user.id,
      // Indicamos si el inicio de sesión fue como superusuario
      superUserAccess: isSuperUser,
    });
  } catch (error) {
    res.status(401).send({ error: "Wrong user or Password" });
  }
};


//Obtiene que usuario esta autenticado
exports.usuarioAutenticado = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("password").select("nombre");
    console.log("autenticadoUSER", user);
    res.json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Hubo un error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "El Usuario no Existe" });
    }

    // Enviar Email con instrucciones
    await restorePasswordEmail({
      id: user._id,
      email,
      nombre: user.nombre,
    });

    return res.status(200).json({ msg: "Hemos enviado un email con las instrucciones" });
  } catch (error) {
    console.log(error);
  }
};

exports.changePasswordUser = async (req, res) => {
  const { email, password, id } = req.body;
  console.log("email", email);
  console.log("password", password);
  console.log("id", id);

  let user = await User.findById(id);
  if (!user) {
    const error = new Error("El Usuario no existe");
    return res.status(400).json({ msg: error.message });
  } else {
    try {
      console.log("user", user);
      hashPassword(password).then((res) =>
        User.findOneAndUpdate(
          { email: user.email },
          { password: res },
          {
            new: true,
          }
        )
      );
    } catch (error) {
      console.log(error);
    }
  }
  res.status(200).json({ msg: "User updated successfully" });
};
