import {StyleSheet, Text, TouchableOpacity} from 'react-native';

interface btnProps{
    title : string,
    onPress : () => void
};

export default function MyButton({ title, onPress }: btnProps) {
    return(

        <TouchableOpacity style={styles.btn} onPress={onPress}>
            <Text style={styles.txt}>{title}</Text>
        </TouchableOpacity>
    )
}
    
const styles = StyleSheet.create({
    btn: {
        backgroundColor: 'blue',
        borderRadius: 15,
        width: "100%",
        padding:10
    },
    txt : {
        fontWeight:"bold",
        color:"white",
        fontSize:18
    },

});