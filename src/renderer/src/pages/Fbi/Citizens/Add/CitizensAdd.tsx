import { useState, type FormEvent } from "react";
import Input from "../../../../components/Input/Input";
import styles from "./CitizensAdd.module.scss";
import Button from "../../../../components/Button/Button";
import apiClient from "../../../../utils/api";
import { useAuthStore } from "../../../../store/useAuthStore";
import IconButton from "../../../../components/IconButton/IconButton";
import { Shuffle, X } from "lucide-react";

interface CitizenFormData {
    username: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    date_of_birth: string;
    passport_id: string;
    driver_license_id?: string;
    firearms_license_id?: string;
    place_of_residence?: string;
    profession?: string;
}

function CitizensAdd() {
    const [formData, setFormData] = useState<CitizenFormData>({
        username: "",
        first_name: "",
        last_name: "",
        middle_name: "",
        date_of_birth: "",
        passport_id: "",
        driver_license_id: "",
        firearms_license_id: "",
        place_of_residence: "",
        profession: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const selectedAccount = useAuthStore(state => state.selectedAccount);
    const validateAndRefresh = useAuthStore(state => state.validateAndRefresh);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const generateId = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const handleGenerate = (field: "passport_id" | "driver_license_id" | "firearms_license_id") => {
        setFormData(prev => ({
            ...prev,
            [field]: generateId(),
        }));
    };

    const handleClear = (field: "passport_id" | "driver_license_id" | "firearms_license_id") => {
        setFormData(prev => ({
            ...prev,
            [field]: "",
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (!selectedAccount) {
            setError("Вы не выбрали аккаунт");
            setLoading(false);
            return;
        }

        const updatedAccount = await validateAndRefresh(
            selectedAccount.accessToken,
            selectedAccount.refreshToken
        );

        if (!updatedAccount) {
            setError("Срок действия сессии истёк. Авторизуйтесь заново.");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                username: formData.username,
                first_name: formData.first_name,
                last_name: formData.last_name,
                middle_name: formData.middle_name,
                date_of_birth: new Date(formData.date_of_birth).toISOString(),
                passport_id: parseInt(formData.passport_id),
                driver_license_id: formData.driver_license_id
                    ? parseInt(formData.driver_license_id)
                    : null,
                firearms_license_id: formData.firearms_license_id
                    ? parseInt(formData.firearms_license_id)
                    : null,
                place_of_residence: formData.place_of_residence || null,
                profession: formData.profession || null,
                wanted: false,
                wanted_reason: null,
            };

            const response = await apiClient.post(
                "/roleplay/fbi/citizens",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${updatedAccount.accessToken}`,
                    },
                }
            );

            console.log("Citizen created:", response.data);
            setSuccess(true);

            setFormData({
                username: "",
                first_name: "",
                last_name: "",
                middle_name: "",
                date_of_birth: "",
                passport_id: "",
                driver_license_id: "",
                firearms_license_id: "",
                place_of_residence: "",
                profession: "",
            });
        } catch (err) {
            console.error("Error creating citizen:", err);
            const msg = "Ошибка при добавлении гражданина";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.add}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h2>Добавить гражданина</h2>

                {error && <div className={styles.error}>{error}</div>}
                {success && (
                    <div className={styles.success}>Гражданин успешно добавлен!</div>
                )}

                <Input
                    className={styles.input}
                    placeholder="Никнейм*"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <Input
                    className={styles.input}
                    placeholder="Имя*"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                />
                <Input
                    className={styles.input}
                    placeholder="Фамилия*"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                />
                <Input
                    className={styles.input}
                    placeholder="Отчество*"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    required
                />
                <Input
                    className={styles.input}
                    placeholder="Дата рождения*"
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                />

                {/* Паспорт */}
                <div className={styles.row}>
                    <Input
                        className={styles.input}
                        placeholder="Идентификатор паспорта*"
                        type="number"
                        name="passport_id"
                        value={formData.passport_id}
                        onChange={handleChange}
                        readOnly={true}
                        required
                    />
                    <IconButton
                        type="button"
                        onClick={() => handleGenerate("passport_id")}
                        title="Сгенерировать паспорт"
                    >
                        <Shuffle />
                    </IconButton>
                    <IconButton
                        type="button"
                        onClick={() => handleClear("passport_id")}
                        title="Очистить паспорт"
                    >
                        <X />
                    </IconButton>
                </div>

                {/* Водительское удостоверение */}
                <div className={styles.row}>
                    <Input
                        className={styles.input}
                        placeholder="Идентификатор водительского удостоверения"
                        type="number"
                        name="driver_license_id"
                        value={formData.driver_license_id}
                        onChange={handleChange}
                        readOnly={true}
                    />
                    <IconButton
                        type="button"
                        onClick={() => handleGenerate("driver_license_id")}
                        title="Сгенерировать ВУ"
                    >
                        <Shuffle />
                    </IconButton>
                    <IconButton
                        type="button"
                        onClick={() => handleClear("driver_license_id")}
                        title="Очистить ВУ"
                    >
                        <X />
                    </IconButton>
                </div>

                {/* Лицензия на оружие */}
                <div className={styles.row}>
                    <Input
                        className={styles.input}
                        placeholder="Идентификатор лицензии на огнестрельное оружие"
                        type="number"
                        name="firearms_license_id"
                        value={formData.firearms_license_id}
                        onChange={handleChange}
                        readOnly={true}
                    />
                    <IconButton
                        type="button"
                        onClick={() => handleGenerate("firearms_license_id")}
                        title="Сгенерировать лицензию"
                    >
                        <Shuffle />
                    </IconButton>
                    <IconButton
                        type="button"
                        onClick={() => handleClear("firearms_license_id")}
                        title="Очистить лицензию"
                    >
                        <X />
                    </IconButton>
                </div>

                <Input
                    className={styles.input}
                    placeholder="Место жительства (Ул. <улица>, <номер дома>)"
                    name="place_of_residence"
                    value={formData.place_of_residence}
                    onChange={handleChange}
                />
                <Input
                    className={styles.input}
                    placeholder="Место работы"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                />
                <label>* - обязательный параметр</label>
                <Button type="submit" disabled={loading}>
                    {loading ? "Добавление..." : "Добавить"}
                </Button>
            </form>
        </main>
    );
}

export default CitizensAdd;