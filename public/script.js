// Function to fetch crafts from the API
const getCrafts = async () => {
    try {
        return (await fetch("api/crafts/")).json();
    } catch (error) {
        console.log(error);
    }
};

// Function to display crafts on the webpage
const showCrafts = async () => {
    let craftsJSON = await getCrafts();
    let craftsDiv = document.getElementById("crafts-div");
    craftsDiv.innerHTML = "";

    if (craftsJSON == "") {
        craftsDiv.innerHTML = "Sorry, no crafts";
        return;
    }

    const columns = Array.from({ length: 4 }, () => {
        const col = document.createElement("div");
        craftsDiv.appendChild(col);
        return col;
    });

    craftsJSON.forEach((craft, index) => {
        const section = document.createElement("section");
        section.classList.add("craft-list");
        craftsDiv.append(section);

        const img = document.createElement("img");
        img.src = "images/" + craft.image;
        section.append(img);

        section.onclick = (e) => {
            e.preventDefault();
            displayDetails(craft);
        };

        columns[index % 4].appendChild(section); // Append section to column
    });
};

// Function to display details of a craft
const displayDetails = (craft) => {
    openDialog("dialog-content");
    const detailsSection = document.getElementById("craft-details");
    detailsSection.innerHTML = "";
    const imgSection = document.getElementById("place");
    imgSection.innerHTML = "";

    imgSection.classList.remove("hidden");
    detailsSection.classList.remove("hidden");

    const img = document.createElement("img");
    img.src = "images/" + craft.image;
    imgSection.append(img);

    const h3 = document.createElement("h3");
    h3.innerHTML = craft.name;
    detailsSection.append(h3);

    const dLink = document.createElement("a");
    dLink.innerHTML = " &#128465;"; // Moved the icon to the left
    h3.appendChild(dLink); // Append to h3 instead of detailsSection
    dLink.id = "delete-link";

    const eLink = document.createElement("a");
    eLink.innerHTML = "&#9998;";
    h3.appendChild(eLink); // Append to h3 instead of detailsSection
    eLink.id = "edit-link";

    const p = document.createElement("p");
    detailsSection.append(p);
    p.innerHTML = craft.description;

    const h4 = document.createElement("h4");
    detailsSection.append(h4);
    h4.innerHTML = "Supplies: ";

    const ul = document.createElement("ul");
    detailsSection.append(ul);
    craft.supplies.forEach((supply) => {
        const li = document.createElement("li");
        ul.append(li);
        li.innerHTML = supply;
    });

    eLink.onclick = showCraftForm;
    dLink.onclick = deleteCraft.bind(this, craft);

    populateEditForm(craft);
};

// Function to populate edit form with craft details
const populateEditForm = (craft) => {
    const form = document.getElementById("add-craft-form");
    form._id.value = craft._id;
    form.name.value = craft.name;
    form.description.value = craft.description;
    document.getElementById("img-prev").src = "images/" + craft.image; // Fix img-prev src
    //add supplies
    populateSupplies(craft.supplies);
};

// Function to populate supplies section in the edit form
const populateSupplies = (supplies) => {
    const section = document.getElementById("supply-boxes");
    section.innerHTML = ""; // Clear previous supplies
    supplies.forEach((supply) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = supply;
        section.append(input);
    });
};

// Function to handle addition or editing of a craft
const addEditCraft = async (e) => {
    e.preventDefault();
    const form = document.getElementById("add-craft-form");
    const formData = new FormData(form);
    let response;

    // Custom validation for the file input
    const fileInput = document.getElementById("image");
    if (fileInput.files.length === 0 && !isEditing()) {
        // Handle case when no file is selected
        console.log("Please select an image");
        return;
    }

    // Continue with form submission
    formData.append("supplies", getSupplies());

    // Determine whether to send a POST or PUT request based on the presence of _id
    if (form._id.value.trim() == "") {
        response = await fetch("/api/crafts/", {
            method: "POST",
            body: formData,
        });
    } else {
        response = await fetch(`/api/crafts/${form._id.value}`, {
            method: "PUT",
            body: formData,
        });
    }

    // Check if request was successful
    if (response.status != 200) {
        console.log("Error adding / editing data");
    } else {
        await response.json();
        document.getElementById("crafts-div").innerHTML = "";
        resetForm();
        document.getElementById("dialog").style.display = "none";
        showCrafts();
    }
};

// Function to check if the form is in edit mode
const isEditing = () => {
    const form = document.getElementById("add-craft-form");
    return form._id.value.trim() !== "";
};


// Function to get supplies from the edit form
const getSupplies = () => {
    const inputs = document.querySelectorAll("#supply-boxes input");
    let supplies = [];

    inputs.forEach((input) => {
        supplies.push(input.value);
    });

    return supplies;
};

// Function to reset the add/edit form
const resetForm = () => {
    const form = document.getElementById("add-craft-form");
    form.reset();
    form._id.value = "";
    document.getElementById("supply-boxes").innerHTML = "";
    document.getElementById("img-prev").src = "";
};

// Function to display the add/edit form
const showCraftForm = (e) => {
    openDialog("form");
    if (e.target.getAttribute("id") != "edit-link") {
        resetForm();
    }
};

// Function to delete a craft
const deleteCraft = async (craft) => {
    // Display confirmation prompt
    const confirmDelete = window.confirm("Are you sure you want to delete this craft?");

    if (confirmDelete) {
        let response = await fetch(`/api/crafts/${craft._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
        });

        if (response.status != 200) {
            console.log("Error deleting");
            return;
        }

        // Reload the page to refresh the crafts
        window.location.reload();

        resetForm();
        document.getElementById("dialog").style.display = "none";
    }
};

// Function to add a supply input field
const addSupply = (e) => {
    e.preventDefault();
    const section = document.getElementById("supply-boxes");
    const input = document.createElement("input");
    input.type = "text";
    section.append(input);
};

// Function to open the dialog modal
const openDialog = (id) => {
    document.getElementById("dialog").style.display = "block";
    document.querySelectorAll("#dialog-details > *").forEach((item) => {
        item.classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
};

// Initialize the form display
showCrafts();
document.getElementById("dialog-close").onclick = () => {
    document.getElementById("dialog").style.display = "none";
};
document.getElementById("add-craft-form").onsubmit = addEditCraft;
document.getElementById("add-link").onclick = showCraftForm;
document.getElementById("add-supply").onclick = addSupply;
document.getElementById("cancel").onclick = () => {
    resetForm();
    document.getElementById("dialog").style.display = "none";
};
document.getElementById("image").onchange = (e) => {
    const prev = document.getElementById("img-prev");

    // They didn't pick an image
    if (!e.target.files.length) {
        prev.src = "";
        return;
    }

    prev.src = URL.createObjectURL(e.target.files.item(0));
};
