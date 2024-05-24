//@ts-nocheck
import { RosettaStone } from './RosettaStone';

export function build_dictionary() {
	let dictionary = new Map();
	let rosetta_stones = [
		new RosettaStone('Montag', 'Monday', 'Lunes'),
		new RosettaStone('Dienstag', 'Tuesday', 'Martes'),
		new RosettaStone('Mittwoch', 'Wednesday', 'Miércoles'),
		new RosettaStone('Donnerstag', 'Thursday', 'Jueves'),
		new RosettaStone('Freitag', 'Friday', 'Viernes'),
		new RosettaStone('Samstag', 'Saturday', 'Sábado'),
		new RosettaStone('Sonntag', 'Sunday', 'Domingo'),
		new RosettaStone('Hallo', 'Hello', '¡Hola'),
		new RosettaStone('Raum', 'Room', 'Aula'),
		new RosettaStone('Fach', 'Subject', 'Asignatura'),
		new RosettaStone('Lehrer', 'Teacher', 'Maestro'),
		new RosettaStone('Design', 'Design', 'Diseño'),
		new RosettaStone('Hell', 'Bright', 'Brillante'),
		new RosettaStone('Dunkel', 'Dark', 'Oscuro'),
		new RosettaStone('Pink', 'Pink', 'Rosa'),
		new RosettaStone('Vorlage', 'Template', 'Plantilla'),
		new RosettaStone('Universität', 'University', 'Universidad'),
		new RosettaStone('Schule', 'School', 'Escuela'),
		new RosettaStone('Individuell', 'Custom', 'A medida'),
		new RosettaStone('Stunden', 'Hours', 'Horas'),
		new RosettaStone('Tage', 'Days', 'Días'),
		new RosettaStone('Abmelden', 'Sign out', 'Cerrar sesión'),
		new RosettaStone('Anmelden', 'Sign in', 'Registrarse'),
		new RosettaStone('Registrieren', 'Sign up', 'Registrarse'),
		new RosettaStone('Passwort', 'Password', 'Contraseña'),
		new RosettaStone('E-Mail', 'E-Mail', 'Correo electrónico'),
		new RosettaStone('Benutzername', 'Username', 'Nombre de usuario'),
		new RosettaStone('Freunde', 'Friends', 'Amigos'),
		new RosettaStone('Anfragen', 'Requests', 'Solicitudes'),
		new RosettaStone('Hinzufügen', 'Add', 'Añadir'),
		new RosettaStone('Speichern', 'Save', 'Guardar'),
		new RosettaStone('Name', 'Name', 'Nombre'),
		new RosettaStone(
			'Erfolgreich registriert, bitte E-Mail bestätigen!',
			'Successfully registered, please confirm E-Mail!',
			'¡Registrado con éxito, confirme el correo electrónico!'
		),
		new RosettaStone(
			'Erfolgreich angemeldet!',
			'Successfully signed in!',
			'¡Registrado con éxito!'
		),
		new RosettaStone(
			'Erfolgreich abgemeldet!',
			'Successfully signed out!',
			'¡Desconectado con éxito!'
		),
		new RosettaStone(
			'Du kannst dich nicht selbst hinzufügen!',
			"You can't add yourself!",
			'¡No puedes agregarte a ti mismo!'
		),
		new RosettaStone('ist bereits dein Freund!', 'is already your friend!', '¡ya es tu amigo!'),
		new RosettaStone('existiert nicht!', "doesn't exist!", '¡no existe!'),
		new RosettaStone(
			'hat deine Anfrage erhalten!',
			'has received your request!',
			'¡ha recibido tu solicitud!'
		),
		new RosettaStone('Niemand', 'Nobody', 'Nadie'),
		new RosettaStone('Keine Gruppe', 'No group', 'Sin grupo'),
		new RosettaStone('Gruppen', 'Groups', 'Grupos'),
		new RosettaStone(
			'Leere Gruppen werden entfernt!',
			'Empty groups will be removed!',
			'¡Los grupos vacíos serán eliminados!'
		),
		new RosettaStone('Neue Gruppe', 'New group', 'Nuevo grupo'),
		new RosettaStone('Suche', 'Search', 'Buscar'),
		new RosettaStone(
			'Bist du sicher, dass du den Freund aus der Gruppe entfernen willst?',
			'Are you sure you want to remove the friend from the group?',
			'¿Estás seguro de que quieres eliminar al amigo del grupo?'
		),
		new RosettaStone('Kurs von ', 'Course of ', 'Curso de '),
		new RosettaStone(
			'Strg + klicken um den ganzen Kurs zu importieren',
			'Crtl + click to import the entire course',
			'Crtl + clic para importar todo el curso'
		),
		new RosettaStone(
			'Du kannst dich nicht selbst entfernen!',
			"You can't remove yourself!",
			'¡No puedes eliminarte a ti mismo!'
		),
		new RosettaStone('wurde gelöscht!', 'has been deleted!', '¡ha sido eliminado!'),
		new RosettaStone('Freund hinzufügen', 'Add friend', 'Añadir amigo'),
		new RosettaStone('Freund entfernen', 'Remove friend', 'Eliminar amigo'),
		new RosettaStone('Löschen', 'Delete', 'Eliminar'),
		new RosettaStone(
			'Freundesdaten konnten nicht abgerufen werden! Weil: ',
			'Retrieve friends data failed! Because: ',
			'¡No se pudieron recuperar los datos de los amigos! Porque: '
		),
		new RosettaStone(
			'Design konnte nicht abgerufen werden! Weil: ',
			'Fetching theme failed! Because: ',
			'¡No se pudo recuperar el diseño! Porque: '
		)
	];
	rosetta_stones.forEach((rosetta_stone, index) => {
		dictionary.set(index, rosetta_stone);
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
	Sign_Out: 21,
	Sign_In: 22,
	Sign_Up: 23,
	Password: 24,
	E_Mail: 25,
	Username: 26,
	Friends: 27,
	Requests: 28,
	Add: 29,
	Save: 30,
	Name: 31,
	Successfully_Registered_Please_Confirm_E_Mail: 32,
	Successfully_Signed_In: 33,
	Successfully_Signed_Out: 34,
	You_Cant_Add_Yourself: 35,
	Is_Already_Your_Friend: 36,
	Doesnt_Exist: 37,
	Has_Received_Your_Request: 38,
	Nobody: 39,
	Friends_Without_Group: 40,
	Groups: 41,
	Empty_Groups_Will_Be_Removed: 42,
	New_Group: 43,
	Search: 44,
	Are_You_Sure: 45,
	Course_Of: 46,
	Tooltip: 47,
	You_Cant_Delete_Yourself: 48,
	Was_Deleted: 49,
	Add_Friend: 50,
	Delete_Friend: 51,
	Delete: 52,
	Retrieve_Friends_Data_Failed: 53,
	Fetching_Theme_Failed: 54
};
