const isNewYearPeriod = () => {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    return (month === 11 && day >= 25) || (month === 0 && day <= 5);
};

export default isNewYearPeriod;