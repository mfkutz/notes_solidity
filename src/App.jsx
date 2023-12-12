import { useState, useEffect } from "react";
import Web3 from "web3";

function App() {
  const [web3, setWeb3] = useState(null);
  const [contrato, setContrato] = useState(null);

  const [idAlumnoInput, setIdAlumnoInput] = useState("");
  const [notaInput, setNotaInput] = useState("");

  const [obtenerNotaId, setObtenerNotaId] = useState("");

  const [notaObtenida, setNotaObtenida] = useState();
  const [hashEvaluacion, setHashEvaluacion] = useState("");

  console.log(notaObtenida);

  useEffect(() => {
    const iniciarWeb3 = async () => {
      if (window.ethereum) {
        const nuevaInstanciaWeb3 = new Web3(ethereum);
        try {
          // Utiliza eth_requestAccounts en lugar de ethereum.enable()
          await ethereum.request({ method: "eth_requestAccounts" });
          setWeb3(nuevaInstanciaWeb3);
        } catch (error) {
          console.error("Usuario denegó acceso a la cuenta");
        }
      } else if (window.web3) {
        const nuevaInstanciaWeb3 = new Web3(web3.currentProvider);
        setWeb3(nuevaInstanciaWeb3);
      } else {
        console.error("No se encontró MetaMask. Instálalo para continuar.");
      }
    };

    iniciarWeb3();
  }, []);

  useEffect(() => {
    // Dirección y ABI del contrato
    const contratoAddress = "0x53fc21fa31e9cb654da916fde1472144cac1abf7";
    const contratoAbi = [
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "bytes32",
            name: "",
            type: "bytes32",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        name: "alumno_evaluado",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "string",
            name: "",
            type: "string",
          },
        ],
        name: "evento_revision",
        type: "event",
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "_idAlumno",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "_nota",
            type: "uint256",
          },
        ],
        name: "Evaluar",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "_idAlumno",
            type: "string",
          },
        ],
        name: "Revision",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [],
        name: "profesor",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "_idAlumno",
            type: "string",
          },
        ],
        name: "VerNotas",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "VerRevisiones",
        outputs: [
          {
            internalType: "string[]",
            name: "",
            type: "string[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ];

    if (web3) {
      const nuevoContrato = new web3.eth.Contract(contratoAbi, contratoAddress);
      setContrato(nuevoContrato);
    }
  }, [web3]);

  const obtenerNotaAlumno = async () => {
    if (contrato) {
      // Ejemplo: Obtener la nota de un alumno
      const idAlumno = obtenerNotaId;
      const nota = await contrato.methods.VerNotas(idAlumno).call();

      console.log(`La nota de ${idAlumno} es: ${nota}`);
      const notaComoNumero = parseInt(nota, 10);
      //seteamos dato en estado
      setNotaObtenida(notaComoNumero);
    }
  };

  const enviarEvaluacion = async () => {
    if (contrato && idAlumnoInput && notaInput) {
      try {
        // Obtener la dirección del usuario desde MetaMask
        const accounts = await web3.eth.getAccounts();
        const fromAddress = accounts[0];

        // Declarar la variable transaccion antes de enviar la transacción
        const transaccion = await contrato.methods
          .Evaluar(idAlumnoInput, parseInt(notaInput, 10))
          .send({ from: fromAddress });

        // Acceder al hash de la transacción
        const transaccionHash = transaccion.transactionHash;

        setHashEvaluacion(transaccionHash);
        console.log(`Hash de la transacción: ${transaccionHash}`);

        console.log(
          `Evaluación enviada para el alumno ${idAlumnoInput} con nota ${notaInput}`
        );
      } catch (error) {
        console.error("Error al enviar la evaluación:", error);
      }
    }
  };


const verSolicitudes = async () => {
  if (contrato) {
    try {
      const accounts = await web3.eth.getAccounts();
      const direccionConectadaMetaMask = accounts[0];

      // Llama a la función VerRevisiones proporcionando la dirección del profesor
      const solicitudes = await contrato.methods.VerRevisiones(direccionConectadaMetaMask).call();
      console.log('Solicitudes:', solicitudes);
    } catch (error) {
      console.error("Error al obtener las revisiones:", error);
    }
  }
};
  return (
    <div className="h-screen flex flex-col bg-gray-800 items-center ">
      <div className="App flex text-white justify-center items-center pt-5 ">
        <div className="bg-neutral-500 max-w-[500px] p-10">
          <h1 className="text-[25px] text-center">Notas de Alumnos</h1>

          <div>
            <h2 className="text-[18px]">Evaluar alumno (solo profesor)</h2>
            <div className="flex gap-3">
              <label htmlFor="idAlumnoInput">ID del Alumno:</label>
              <input
                className="text-black px-2"
                type="text"
                id="idAlumnoInput"
                value={idAlumnoInput}
                onChange={(e) => setIdAlumnoInput(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-1 flex gap-3">
            <label htmlFor="notaInput">Nota:</label>
            <input
              className="text-black w-full"
              type="number"
              id="notaInput"
              value={notaInput}
              onChange={(e) => setNotaInput(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <button onClick={enviarEvaluacion} className="bg-green-500">
              Enviar Evaluación
            </button>

            <div className="flex flex-col pt-1">
              <h2>Ingrese ID alumno para obtener nota:</h2>
              <input
                className="text-black "
                type="text"
                id="idAlumno"
                value={obtenerNotaId}
                onChange={(e) => setObtenerNotaId(e.target.value)}
              />
              <button onClick={obtenerNotaAlumno} className="bg-blue-400">
                Ver nota
              </button>
              <h3>Nota: {notaObtenida}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className=" w-[700px] mt-3">
        <h3 className="text-white">Hash evaluacion: <span className="text-red-400">{hashEvaluacion}</span></h3>
      </div>
      <div>
        <button className="bg-green-500 px-3 mt-3" onClick={verSolicitudes}>Ver revisiones</button>
      </div>
    </div>
  );
}

export default App;
