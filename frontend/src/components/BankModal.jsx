import axios from "axios";
import { useEffect, useState } from "react"
import Alert from "./Alert";

const BankModal = ({ setModal }) => {

    const [amountFormat, setAmountFormat] = useState("0");
    const [amount, setAmount] = useState("");
    const [teamSelect, setTeamSelect] = useState(0);
    const [dataApi, setDataApi] = useState([]);
    const [alert, setAlert] = useState({
        type: "",
        msg: ""
    });

    const clearFields = () => {
        setAmount("");
        setTeamSelect("");
    };

    const handleSubmit = async () => {
        setAmountFormat("0");
        const teamID = Number(teamSelect)
        setAlert({
            type: "",
            msg: ""
        });
        let resp = {};
        try {
            resp = await axios.put(`http://localhost:8080/api/teams/${teamID}`, {
                "cash": (Number(amount) + Number(amountFormat))
            });
            setAlert({
                msg: "Monto actualizado",
                type: "success"
            });
            clearFields();
            handleData();
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

    const handleData = async () => {
        try {
            const { data } = await axios.get("http://localhost:8080/api/teams")
            setDataApi(data);
        } catch (error) {
            setAlert({
                msg: "Hubo un error, llame al patron",
                type: "error"
            });
        }
    };

    const handleTeamSelected = (e) => {
        const value = e.target.value;
        setTeamSelect(value);
        const teamID = Number(value);
        if (teamID !== 0) {
            const team = dataApi.find(tm => tm.id === teamID);
            setAmountFormat(Number(team.cash));
        }
    }

    useEffect(() => {
        handleData();
    }, [])

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
                        <label htmlFor="team" className="block mt-1 text-sm font-medium leading-6 text-gray-900">
                            Selecciona un equipo
                        </label>
                        <select
                            value={teamSelect}
                            onChange={handleTeamSelected}
                            autoComplete="off"
                            name="team"
                            id="team"
                            className={inputClasses + " px-3"}
                            placeholder="0.00"
                        >
                            {
                                dataApi.length === 0 ? <option>No hay equipos</option>
                                    :
                                    <>
                                        <option value={0} defaultChecked>Selecciona un equipo</option>
                                        {
                                            dataApi.map((opt, index) => (<option key={index} value={opt.id}>{opt.name}</option>))
                                        }
                                    </>
                            }
                        </select>
                    </div>
                    <div>
                        <label htmlFor="price" className="block mt-1 text-sm font-medium leading-6 text-gray-900">
                            Puntos <span className="text-sm font-bold ml-2 text-green-700">{Number(amountFormat).toLocaleString()}</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm"></span>
                            </div>
                            <input
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                disabled={Number(teamSelect) === 0}
                                autoComplete="off"
                                type="text"
                                name="price"
                                id="price"
                                className={inputClasses + " pl-7 pr-20"}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <span className="text-sm font-normal ml-2 text-green-700">+ {Number(amount).toLocaleString()}</span>
                </div>
            </div>
            <div className="p-5 flex gap-2 justify-end">
                <button onClick={() => setModal(false)} className={buttonClasses + " bg-neutral-400 hover:bg-neutral-500"}>Cancelar</button>
                <button onClick={handleSubmit} className={buttonClasses + " bg-green-600 hover:bg-green-700"}>Agregar</button>
            </div>
        </>
    )
}

export default BankModal