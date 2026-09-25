import { format } from "date-fns";

const stripTrailingSlash = (str: string) => str.charAt(str.length - 1) == "/" ? str.substr(0, str.length - 1) : str;

const urlUtils = (url: string, queryParams?: string) => {
    // if (process.env.NODE_ENV !== 'development') {
    //     return `${stripTrailingSlash(url)}.json`;
    // }
    return url + (queryParams || '');
}


const defaultDateFormat = "dd-mm-yy";
const inputNumberProps = {
    maxFractionDigits : 3,
    locale:"en-IN"
};

const formatDate = (value: any, dFormat?: string) => {
    try {
        return value ? `${format(new Date(value), dFormat || "dd-MM-yyyy")}` : ""
    } catch (error) {
        return value
    }
}

const refactorDate = (value:any) => {
    try {
        const [day, month, year] = value.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        return dateObj
    } catch (error) {
        console.log("error ::", error)
        return value
    }
}

const formatCurrency = (value: any) => {
    return !!value ? parseInt(value)?.toLocaleString(undefined, { style: 'currency', currency: 'INR' }) : "NA";
}

const formatNumber = (value: any) => {
    return value ? parseInt(value)?.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0
}

const base64Converter = (file: any) => new Promise((resolve, reject) => {
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            let result = reader.result?.toString();
            resolve(result);
        };
        reader.onerror = error => {
            reject(error)
        }
    }
    else {
        resolve("")
    }

});

const shouldAllowAdd = (items: any[]) => {
    if (items.length === 0) return true
    let temp = items[items.length - 1]
    return temp?.item_key &&
        temp?.itemuom_key
}

const convertDateValue = (value: any, reverse?: boolean) => {
    if (value) {
        return reverse ? `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}` : new Date(value);
    }
    return value;
}

// const formatDate = (value: any, reverse?: boolean) => {
//     if (!value) return value;

//     console.log("value received::", value, reverse);
//     console.log("type of value received::", typeof(value), typeof(reverse));

//     let dateObj: Date;

//     if (reverse) {
//         // Convert Date object to yyyy-m-d
//         const toBeReturned = `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`;
//         console.log('returning value', toBeReturned);
//         return toBeReturned;
//     }

//     if (typeof value === 'string') {
//         // Handle dd-mm-yyyy and yyyy-m-d
//         if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
//             const [day, month, year] = value.split('-').map(Number);
//             dateObj = new Date(year, month - 1, day);
//         } else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(value)) {
//             // yyyy-m-d (new Date can parse this correctly)
//             dateObj = new Date(value);
//         } else {
//             console.warn("Unknown date format");
//             dateObj = new Date(value); // Fallback
//         }
//     } else {
//         dateObj = new Date(value);
//     }

//     console.log('returning value', dateObj);
//     return dateObj;
// };

const getMonthsFor = (year: number | null) => {
    if (!year) {
        return [];
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const allMonths = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthsArray = allMonths.map((month, index) => ({
        name: month,
        value: index + 1 // Month index + 1 for 1-based month numbers
    }));

    if (year === currentYear) {
        return monthsArray.slice(0, currentMonth + 1);
    } else {
        return monthsArray;
    }
};


const getPreviousYears = (value: number | null) => {
    if (!value)
        return []

    const currentYear = new Date().getFullYear();
    const lastYears = [];
    for (let i = 0; i < value; i++) {
        lastYears.push(currentYear - i);
    }
    return lastYears
}

const tdsDropdownOptions = (event: any, setState: Function, options?: Array<number>) => {
    const filtered = options || [1, 2, 3].filter(item =>
        item.toString().includes(event.query)
    );
    setState(filtered);
};

function adjustNumber(value: any, action: string) {
    let roundedValue, difference;

    if (action === 'A') {
        roundedValue = Math.ceil(value); 
        difference = parseFloat((roundedValue - value).toFixed(2)); 
        return {
            rounded: roundedValue.toFixed(2),
            remainder: difference
        };
    } else if (action === 'S') {
        roundedValue = Math.floor(value);
        difference = parseFloat((value - roundedValue).toFixed(2));
        return {
            rounded: roundedValue.toFixed(2),
            remainder: difference
        };
    } else {
        return {
            rounded: value?.toFixed(2),
            remainder: 0
        };
    }
}

// Helper to reverse date string from dd-mm-yyyy to yyyy-mm-dd
const reverseDate = (dateStr: string): string => {
    const parts = dateStr?.split("-");
    if (parts?.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // yyyy-mm-dd
    }
    return dateStr; // return as-is if format is unexpected
};

const updateDateFormate = async (data: any[], dateKey: string) => {
    console.log("data for the date change function ::", data, "dateKey ::", dateKey);

    if (!Array.isArray(data)) return [];

    return data.map(item => {
        // Clone the object to avoid mutating a read-only one
        const newItem = { ...item };

        if (item?.visit_date) {
            console.log("visit_date ::", item.visit_date);
            newItem.visit_date = reverseDate(item.visit_date);
        } else if (item?.last_followup_date) {
            let followUpDate = item.last_followup_date;
            console.log("last_followup_date ::", followUpDate);
            newItem.last_followup_date = reverseDate(followUpDate);
        }

        console.log("newItem ::", newItem)

        return newItem;
    });
};

const cleanDecimal = (value: any) => {
  const decimalPart = value.toString().split(".")[1];
  
  if (decimalPart && decimalPart.length > 2) {
    return parseFloat(value.toFixed(2)); 
  }

  return value; 
}


export {
    urlUtils,
    formatDate,
    formatCurrency,
    formatNumber,
    base64Converter,
    shouldAllowAdd,
    convertDateValue,
    getMonthsFor,
    getPreviousYears,
    defaultDateFormat,
    inputNumberProps,
    tdsDropdownOptions,
    adjustNumber,
    updateDateFormate,
    cleanDecimal,
    reverseDate,
    refactorDate
};