//@ts-nocheck
/**
 * @typedef Styles
 * @property {String} primaryColor - The primary color of the schedule
 * @property {String} secondaryColor - The secondary color of the schedule
 * @property {String} tableHeaderMondayFontColor - The font color of the Monday table header
 * @property {String} tableHeaderTuesdayFontColor - The font color of the Tuesday table header
 * @property {String} tableHeaderWednesdayFontColor - The font color of the Wednesday table header
 * @property {String} tableHeaderThursdayFontColor - The font color of the Thursday table header
 * @property {String} tableHeaderFridayFontColor - The font color of the Friday table header
 * @property {String} tableHeaderSaturdayFontColor - The font color of the Saturday table header
 * @property {String} tableHeaderSundayFontColor - The font color of the Sunday table header
 * @property {String} tableHeaderMondayBackgroundColor - The background color of the Monday table header
 * @property {String} tableHeaderTuesdayBackgroundColor - The background color of the Tuesday table header
 * @property {String} tableHeaderWednesdayBackgroundColor - The background color of the Wednesday table header
 * @property {String} tableHeaderThursdayBackgroundColor - The background color of the Thursday table header
 * @property {String} tableHeaderFridayBackgroundColor - The background color of the Friday table header
 * @property {String} tableHeaderSaturdayBackgroundColor - The background color of the Saturday table header
 * @property {String} tableHeaderSundayBackgroundColor - The background color of the Sunday table header
 */
export default class StyleClass {
	/**
	 * @param {Object} StyleDTO - An object containing the style properties
	 * @param {String} StyleDTO.primaryColor - The primary color of the schedule
	 * @param {String} StyleDTO.secondaryColor - The secondary color of the schedule
	 * @param {String} StyleDTO.tableHeaderMondayFontColor - The font color of the Monday table header
	 * @param {String} StyleDTO.tableHeaderTuesdayFontColor - The font color of the Tuesday table header
	 * @param {String} StyleDTO.tableHeaderWednesdayFontColor - The font color of the Wednesday table header
	 * @param {String} StyleDTO.tableHeaderThursdayFontColor - The font color of the Thursday table header
	 * @param {String} StyleDTO.tableHeaderFridayFontColor - The font color of the Friday table header
	 * @param {String} StyleDTO.tableHeaderSaturdayFontColor - The font color of the Saturday table header
	 * @param {String} StyleDTO.tableHeaderSundayFontColor - The font color of the Sunday table header
	 * @param {String} StyleDTO.tableHeaderMondayBackgroundColor - The background color of the Monday table header
	 * @param {String} StyleDTO.tableHeaderTuesdayBackgroundColor - The background color of the Tuesday table header
	 * @param {String} StyleDTO.tableHeaderWednesdayBackgroundColor - The background color of the Wednesday table header
	 * @param {String} StyleDTO.tableHeaderThursdayBackgroundColor - The background color of the Thursday table header
	 * @param {String} StyleDTO.tableHeaderFridayBackgroundColor - The background color of the Friday table header
	 * @param {String} StyleDTO.tableHeaderSaturdayBackgroundColor - The background color of the Saturday table header
	 * @param {String} StyleDTO.tableHeaderSundayBackgroundColor - The background color of the Sunday table header
	 */
	constructor({
		primaryColor,
		secondaryColor,
		tableHeaderMondayFontColor,
		tableHeaderTuesdayFontColor,
		tableHeaderWednesdayFontColor,
		tableHeaderThursdayFontColor,
		tableHeaderFridayFontColor,
		tableHeaderSaturdayFontColor,
		tableHeaderSundayFontColor,
		tableHeaderMondayBackgroundColor,
		tableHeaderTuesdayBackgroundColor,
		tableHeaderWednesdayBackgroundColor,
		tableHeaderThursdayBackgroundColor,
		tableHeaderFridayBackgroundColor,
		tableHeaderSaturdayBackgroundColor,
		tableHeaderSundayBackgroundColor
	}) {
		this.primaryColor = primaryColor;
		this.secondaryColor = secondaryColor;
		this.tableHeaderMondayFontColor = tableHeaderMondayFontColor;
		this.tableHeaderTuesdayFontColor = tableHeaderTuesdayFontColor;
		this.tableHeaderWednesdayFontColor = tableHeaderWednesdayFontColor;
		this.tableHeaderThursdayFontColor = tableHeaderThursdayFontColor;
		this.tableHeaderFridayFontColor = tableHeaderFridayFontColor;
		this.tableHeaderSaturdayFontColor = tableHeaderSaturdayFontColor;
		this.tableHeaderSundayFontColor = tableHeaderSundayFontColor;
		this.tableHeaderMondayBackgroundColor = tableHeaderMondayBackgroundColor;
		this.tableHeaderTuesdayBackgroundColor = tableHeaderTuesdayBackgroundColor;
		this.tableHeaderWednesdayBackgroundColor = tableHeaderWednesdayBackgroundColor;
		this.tableHeaderThursdayBackgroundColor = tableHeaderThursdayBackgroundColor;
		this.tableHeaderFridayBackgroundColor = tableHeaderFridayBackgroundColor;
		this.tableHeaderSaturdayBackgroundColor = tableHeaderSaturdayBackgroundColor;
		this.tableHeaderSundayBackgroundColor = tableHeaderSundayBackgroundColor;
	}
}
