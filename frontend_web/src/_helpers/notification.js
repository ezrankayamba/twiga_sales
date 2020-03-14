let notifyMe = (msg, cb) => {
    let title = "Warning"
    let options = {
        body: msg,
        requireInteraction: false
    }
    let handleClick = () => {
        console.log("Notification clicked!")
    }
    if (!("Notification" in window)) {
        if (cb) cb(false)
    } else if (Notification.permission === "granted") {
        let notification = new Notification(title, options);
        notification.onclick = handleClick
        if (cb) cb(notification)
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                let notification = new Notification(title, options);
                notification.onclick = handleClick
                if (cb) cb(notification)
            } else {
                if (cb) cb(false)
            }
        });
    } else {
        if (cb) cb(false)
    }
}

export {notifyMe}

