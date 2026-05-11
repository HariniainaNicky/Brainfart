export const Footer = () => {
    const currentDate = new Date().getFullYear();
    return (
        <div className="m-10 self-center text-sm text-muted-foreground">
            &copy; {currentDate} BrainFart &mdash; NickyHariniaina. All rights reserved.
        </div>
    );
};
