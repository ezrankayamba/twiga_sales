import dayjs from "dayjs";

export const DateTime = {
    fmt: (str, tpl="DD/MM/YYYY HH:mm") => dayjs(str).format(tpl)
}
