export class authenticationService {

    public sec = 0;
    public min = 0;
    public hour = 0;
    public time: string;

    startStopWatch() {
        this.time = "00:00:00";
        setInterval(() => {
            console.log(this.time)
            this.sec++;
            this.time = (this.hour + ':' + this.min + ':' + this.sec);
            if (this.sec === 60) {
                this.min++;
                this.sec = 0;
                if (this.min === 60) {
                    this.hour++;
                    this.min = 0;
                }
            }
        }, 1000);
    }

    getTime() {
        return this.time;
    }
}