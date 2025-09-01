export interface CreateEventForm {
  title:       string;
  description: string;
  date:        string;    // YYYY-MM-DD
  location:    string;
  imageFile?:  File;
}
