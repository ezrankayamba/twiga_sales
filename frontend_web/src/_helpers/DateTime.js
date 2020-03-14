import dayjs from "dayjs";

export const DateTime = {
    fmt: (str) => dayjs(str).format("DD/MM/YYYY HH:mm")
}
