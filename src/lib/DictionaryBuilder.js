//@ts-nocheck
import { RosettaStone } from "./RosettaStone";

export function build_dictionary(){
    let dictionary = new Map();
    let rosetta_stones = [
        new RosettaStone("Montag", "Monday", "Lunes"),
        new RosettaStone("Dienstag", "Tuesday", "Martes"),
        new RosettaStone("Mittwoch", "Wednesday", "Miércoles"),
        new RosettaStone("Donnerstag", "Thursday", "Jueves"),
        new RosettaStone("Freitag", "Friday", "Viernes"),
        new RosettaStone("Samstag", "Saturday", "Sábado"),
        new RosettaStone("Sonntag", "Sunday", "Domingo"),
        new RosettaStone("Hallo", "Hello", "Hola"),
        new RosettaStone("Raum", "Room", "Aula"),
        new RosettaStone("Fach", "Subject", "Asignatura"),
        new RosettaStone("Lehrer", "Teacher", "Maestro"),
        new RosettaStone("Design", "Design", "Diseño"),
        new RosettaStone("Hell", "Bright", "Brillante"),
        new RosettaStone("Dunkel", "Dark", "Oscuro"),
        new RosettaStone("Pink", "Pink", "Rosa"),
        new RosettaStone("Vorlage", "Template", "Plantilla"),
        new RosettaStone("Universität", "University", "Universidad"),
        new RosettaStone("Schule", "School", "Escuela"),
        new RosettaStone("Individuell", "Custom", "A medida"),
        new RosettaStone("Stunden", "Hours", "Horas"),
        new RosettaStone("Tage", "Days", "Días"),
        new RosettaStone("Abmelden", "Sign out", "Cerrar sesión"),
        new RosettaStone("Anmelden", "Sign in", "Registrarse"),
        new RosettaStone("Registrieren", "Sign up", "Registrarse"),
        new RosettaStone("Passwort", "Password", "Contraseña"),
        new RosettaStone("E-Mail", "E-Mail", "Correo electrónico"),
        new RosettaStone("Benutzername", "Username", "Nombre de usuario"),
        new RosettaStone("Freunde", "Friends", "Amigos"),
        new RosettaStone("Afragen", "Requests", "Solicitudes"),
        new RosettaStone("Hinzufügen", "Add", "Añadir"),    
        new RosettaStone("Speichern", "Save", "Guardar")
    ];
    rosetta_stones.forEach((rosetta_stone, index) => {
        dictionary.set(index, rosetta_stone)
    });
    return dictionary;
}

export const mapping = {
    Day_1: 0,
    Day_2: 1,
    Day_3: 2,
    Day_4: 3,
    Day_5: 4,
    Day_6: 5,
    Day_7: 6,
    Greeting: 7,
    Room: 8,
    Subject: 9,
    Teacher: 10,
    Design: 11,
    Bright: 12,
    Dark: 13,
    Pink: 14,
    Template: 15,
    University: 16,
    School: 17,
    Custom: 18,
    Hours: 19,
    Days: 20,
    Sign_out: 21,
    Sign_in: 22,
    Sign_up: 23,
    Password: 24,
    E_Mail: 25,
    Username: 26,
    Friends: 27,
    Requests: 28,
    Add: 29,
    Save: 30
}
console.log(build_dictionary().get(mapping.Day_1)['de']);