import { useEffect, useState } from "react";


const useKeyboardNavigation = (size: any, data: any) => {
    const [activeCursor, setActiveCursor] = useState<any>(0);




    const handleKeyPress = (event: any) => {
        event.preventDefault();
        const Selected = document.querySelector(".selected");

        if (event.key === 'ArrowDown') {
            Selected?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            setActiveCursor((result: any) => {
                const newCursor = result < size - 1 ? result + 1 : result;
                return newCursor;
            });

        } else if (event.key === 'ArrowUp') {
            Selected?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            setActiveCursor((result: any) => {
                const newCursor = result > 0 ? result - 1 : 0;
                return newCursor;
            });
        }
    };


    // Reset when size changes
    useEffect(() => {
        setActiveCursor(0);
    }, []);

    useEffect(() => {
        var time = setTimeout(() => {
            document.addEventListener('keydown', handleKeyPress);
        }, 60);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            clearTimeout(time);
        }
    }, [size, activeCursor]);

    useEffect(() => {
        document.addEventListener('keyup', HandleKeyRelease);

        return () => {
            document.removeEventListener('keyup', HandleKeyRelease);
        }
    }, [size, activeCursor]);


    const HandleKeyRelease = async (event: any) => {
        await event.preventDefault();
        if (event.key === "Enter") {

            console.log("enter",activeCursor)

        }
    }





    return [activeCursor, setActiveCursor];
};

export default useKeyboardNavigation;