import axios from "axios";
import { useRef, useState } from "react";
import Alert from "./Alert";

const AddTeamModal = ({ setModal }) => {

    const colorRef = useRef(null);

    const [amountFormat, setAmountFormat] = useState("0");

    const [amount, setAmount] = useState("");
    const [teamName, setTeamName] = useState("");
    const [color, setColor] = useState("#FFFFFF")
    const [alert, setAlert] = useState({
        type: "",
        msg: ""
    });

    const handleInputChange = (e) => {

        setAmount(e.target.value);
        setAmountFormat(Number(e.target.value).toLocaleString())
    };

    const clearFields = () => {
        setAmount("");
        setTeamName("");
        setColor("#FFFFFF");
    };

    const handleSubmit = async () => {
        setAmountFormat("0");
        setAlert({
            type: "",
            msg: ""
        });
        let resp = {};
        try {
            resp = await axios.post("http://localhost:8080/api/teams", {
                "name": teamName,
                "cash": amount,
                "color": color
            });
            setAlert({
                msg: "Equipo creado",
                type: "success"
            });
            clearFields();
        } catch (error) {
            resp = error
            setAlert({
                msg: "Hubo un error",
                type: "error"
            });
            console.log(error);
        }

        console.log(resp);
    };

    const inputClasses = "block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-[#23c8ac] sm:text-sm sm:leading-6"
    const buttonClasses = "transition rounded px-4 py-1 text-white";
    return (
        <>
            <div className="border-b p-5">
                <div className="flex flex-col gap-2">
                    {
                        alert.msg && <Alert type={alert.type} msg={alert.msg} />
                    }
                    <div>
                        <label htmlFor="name" className="block mt-1 text-sm font-medium leading-6 text-gray-900">
                            Nombre del equipo
                        </label>
                        <input
                            value={teamName}
                            onChange={e => setTeamName(e.target.value)}
                            autoComplete="off"
                            type="text"
                            name="name"
                            id="name"
                            className={inputClasses + " px-3"}
                            placeholder="Los manitos"
                        />
                    </div>
                    <div>
                        <label htmlFor="name" className="block mt-1 text-sm font-medium leading-6 text-gray-900">
                            Color del equipo
                        </label>
                        <input
                            ref={colorRef}
                            value={color}
                            onChange={e => setColor(e.target.value)}
                            type="color"
                            name="color"
                            id="color"
                            className={inputClasses + " px-0 py-0"}
                        />
                    </div>
                    <div>
                        <label htmlFor="price" className="block mt-1 text-sm font-medium leading-6 text-gray-900">
                            Puntaje inicial <span className="text-sm font-normal ml-2 text-neutral-400">{amountFormat}</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            {/* <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div> */}
                            <input
                                value={amount}
                                onChange={handleInputChange}
                                autoComplete="off"
                                type="text"
                                name="price"
                                id="price"
                                className={inputClasses + " pl-7 pr-20"}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-5 flex gap-2 justify-end">
                <button onClick={() => setModal(false)} className={buttonClasses + " bg-neutral-400 hover:bg-neutral-500"}>Cancelar</button>
                <button onClick={handleSubmit} className={buttonClasses + " bg-green-600 hover:bg-green-700"}>Agregar</button>
            </div>
        </>
    )
}

export default AddTeamModal