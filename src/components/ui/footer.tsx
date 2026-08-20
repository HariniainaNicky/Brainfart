export const Footer = () => {
    const currentDate = new Date().getFullYear();
    return (
        <div className="m-10 self-center text-sm text-muted-foreground flex flex-col items-center gap-1">
            <span>
                &copy; {currentDate} BrainFart &mdash; NickyHariniaina. All rights reserved.
            </span>
            <span>
                Questions from{" "}
                <a
                    href="https://opentdb.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground transition-colors"
                >
                    Open Trivia Database
                </a>{" "}
                (CC BY-SA 4.0)
            </span>
        </div>
    );
};