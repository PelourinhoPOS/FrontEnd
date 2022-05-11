import { Subject } from "rxjs";

export class authenticationService {

    public sec = 0;
    public min = 0;
    public hour = 0;
    public time: string;
    public refreshData = new Subject<void>();
    public interval

    startStopWatch() {
        this.time = "00:00:00";

        this.interval = setInterval(() => {

            this.sec++;
            this.time = (this.hour + ':' + this.min + ':' + this.sec);

            if (this.sec < 10 && this.min < 10 && this.hour < 10) {
                this.time = ('0' + this.hour + ':0' + this.min + ':0' + this.sec);
            }

            if (this.sec >= 10 && this.min < 10 && this.hour < 10) {
                this.time = ('0' + this.hour + ':0' + this.min + ':' + this.sec);
            }

            if (this.sec < 10 && this.min >= 10 && this.hour < 10) {
                this.time = ('0' + this.hour + ':' + this.min + ':0' + this.sec);
            }

            if (this.sec >= 10 && this.min >= 10 && this.hour < 10) {
                this.time = ('0' + this.hour + ':' + this.min + ':' + this.sec);
            }

            if (this.sec < 10 && this.min < 10 && this.hour >= 10) {
                this.time = (this.hour + ':0' + this.min + ':0' + this.sec);
            }

            if (this.sec >= 10 && this.min < 10 && this.hour >= 10) {
                this.time = (this.hour + ':0' + this.min + ':' + this.sec);
            }

            if (this.sec < 10 && this.min >= 10 && this.hour >= 10) {
                this.time = (this.hour + ':' + this.min + ':0' + this.sec);
            }

            if (this.sec === 59) {
                this.min++;
                this.sec = -1;
                if (this.min === 59) {
                    this.min = 0;
                    this.sec = 0;
                    this.hour++;
                }
            }
            this.refreshData.next();
        }, 1000);
    }

    stopWatch() {
        clearInterval(this.interval);
    }

    getTime() {
        return this.time;
    }
}