import axios from "axios";
import { useEffect, useState } from "react";
import Alert from "./Alert";
import Input from "./ui/Input";
import Button from "./ui/Button";

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
        const teamID = Number(teamSelect);
        setAlert({
            type: "",
            msg: ""
        });

        try {
            await axios.put(`http://localhost:8080/api/teams/${teamID}`, {
                cash: (Number(amount) + Number(amountFormat))
            });
            
            setAlert({
                msg: "Puntos actualizados exitosamente",
                type: "success"
            });
            clearFields();
            handleData();
        } catch (error) {
            setAlert({
                msg: "Hubo un error al actualizar los puntos",
                type: "error"
            });
            console.error(error);
        }
    };

    const handleData = async () => {
        try {
            const { data } = await axios.get("http://localhost:8080/api/teams");
            setDataApi(data);
        } catch (error) {
            setAlert({
                msg: "Error al cargar los equipos",
                type: "error"
            });
            console.error(error);
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
    };

    useEffect(() => {
        handleData();
    }, []);

    return (
        <div className="space-y-6">
            {alert.msg && <Alert type={alert.type} msg={alert.msg} />}
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Selecciona un equipo
                    </label>
                    <select
                        value={teamSelect}
                        onChange={handleTeamSelected}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    >
                        {dataApi.length === 0 ? (
                            <option>No hay equipos disponibles</option>
                        ) : (
                            <>
                                <option value={0}>Selecciona un equipo</option>
                                {dataApi.map((team) => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}
                                    </option>
                                ))}
                            </>
                        )}
                    </select>
                </div>

                <div className="space-y-2">
                    <Input
                        label={`Puntos actuales: ${Number(amountFormat).toLocaleString()}`}
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0"
                        disabled={Number(teamSelect) === 0}
                    />
                    {amount && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                            Nuevo total: {Number(Number(amount) + Number(amountFormat)).toLocaleString()}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <Button
                    variant="ghost"
                    onClick={() => setModal(false)}
                >
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={Number(teamSelect) === 0 || !amount}
                >
                    Actualizar Puntos
                </Button>
            </div>
        </div>
    );
};

export default BankModal;